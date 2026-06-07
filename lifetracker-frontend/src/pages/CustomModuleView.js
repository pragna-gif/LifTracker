import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement, Tooltip, Legend, Title
} from 'chart.js';
import api from '../api/axios';
import AiBot from '../components/AiBot';
import './Page.css';
import './CustomModuleView.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Title);

const COLORS = ['#6c63ff','#f59e0b','#10b981','#ef4444','#3b82f6','#f97316','#8b5cf6','#ec4899'];

export default function CustomModuleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule]   = useState(null);
  const [entries, setEntries] = useState([]);
  const [fields, setFields]   = useState([]);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [sumRes, entriesRes] = await Promise.all([
      api.get(`/custom/modules/${id}/summary`),
      api.get(`/custom/modules/${id}/entries`)
    ]);
    const mod = sumRes.data.module;
    setModule({ ...mod, totalEntries: sumRes.data.totalEntries });
    const fieldDefs = JSON.parse(mod.fields || '[]');
    setFields(fieldDefs);
    const init = {};
    fieldDefs.forEach(f => { init[f.name] = f.type === 'boolean' ? false : ''; });
    setForm(init);
    setEntries(entriesRes.data.map(e => ({ ...e, parsedData: JSON.parse(e.data || '{}') })));
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/custom/entries', { moduleId: parseInt(id), data: JSON.stringify(form) });
    const init = {};
    fields.forEach(f => { init[f.name] = f.type === 'boolean' ? false : ''; });
    setForm(init);
    fetchAll();
  };

  const handleDelete = async (entryId) => {
    await api.delete(`/custom/entries/${entryId}`);
    fetchAll();
  };

  // ── Analytics builders ────────────────────────────────────────────────────

  // Entries per day (last 14 days)
  const entryTrendChart = (() => {
    if (entries.length === 0) return null;
    const counts = {};
    entries.forEach(e => { counts[e.loggedOn] = (counts[e.loggedOn] || 0) + 1; });
    const sorted = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).slice(-14);
    return {
      labels: sorted.map(([d]) => d),
      datasets: [{ label: 'Entries', data: sorted.map(([, v]) => v),
        borderColor: '#6c63ff', backgroundColor: '#6c63ff22',
        fill: true, tension: 0.4, pointRadius: 4 }]
    };
  })();

  // Per-field charts
  const fieldCharts = fields.map(field => {
    if (entries.length === 0) return null;

    if (field.type === 'number') {
      const vals = entries.slice(0, 15).reverse()
        .map(e => ({ x: e.loggedOn, y: Number(e.parsedData[field.name]) || 0 }))
        .filter(v => v.y !== 0);
      if (vals.length === 0) return null;
      const avg = (vals.reduce((s, v) => s + v.y, 0) / vals.length).toFixed(1);
      const max = Math.max(...vals.map(v => v.y));
      const min = Math.min(...vals.map(v => v.y));
      return {
        field, type: 'number', avg, max, min,
        chart: {
          labels: vals.map(v => v.x),
          datasets: [{ label: field.label, data: vals.map(v => v.y),
            backgroundColor: '#6c63ff', borderRadius: 6 }]
        }
      };
    }

    if (field.type === 'dropdown') {
      const counts = {};
      entries.forEach(e => {
        const v = e.parsedData[field.name];
        if (v) counts[v] = (counts[v] || 0) + 1;
      });
      if (Object.keys(counts).length === 0) return null;
      return {
        field, type: 'dropdown',
        chart: {
          labels: Object.keys(counts),
          datasets: [{ data: Object.values(counts), backgroundColor: COLORS, borderWidth: 0 }]
        }
      };
    }

    if (field.type === 'boolean') {
      const yes = entries.filter(e => e.parsedData[field.name] === true || e.parsedData[field.name] === 'true').length;
      const no  = entries.length - yes;
      if (yes === 0 && no === 0) return null;
      return {
        field, type: 'boolean',
        yes, no, pct: Math.round((yes / entries.length) * 100),
        chart: {
          labels: ['Yes ✅', 'No ❌'],
          datasets: [{ data: [yes, no], backgroundColor: ['#10b981', '#f3f4f6'], borderWidth: 0 }]
        }
      };
    }

    return null;
  }).filter(Boolean);

  const renderInput = (field) => {
    const val = form[field.name] ?? '';
    const onChange = v => setForm({ ...form, [field.name]: v });
    if (field.type === 'boolean')
      return <label key={field.name} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={!!form[field.name]} onChange={e => onChange(e.target.checked)} />
        {field.label}
      </label>;
    if (field.type === 'dropdown')
      return <select key={field.name} className="form-input" value={val} onChange={e => onChange(e.target.value)} required={field.required}>
        <option value="">— {field.label} —</option>
        {(field.options || []).map(o => <option key={o}>{o}</option>)}
      </select>;
    return <input key={field.name} className="form-input"
      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
      placeholder={field.label} value={val}
      onChange={e => onChange(e.target.value)} required={field.required} />;
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <button onClick={() => navigate('/custom')} className="back-btn">← Back</button>
        <h1 className="page-title">{module?.icon} {module?.name}</h1>
      </div>
      <p className="page-sub">{module?.totalEntries} entries total</p>

      {/* Add Entry Form */}
      <form className="add-form" onSubmit={handleSubmit}>
        {fields.map(f => renderInput(f))}
        <button className="btn-primary" type="submit">+ Log Entry</button>
      </form>

      {/* ── Analytics Section ── */}
      {entries.length > 0 && (
        <>
          {/* Summary stat cards */}
          <div className="analytics-stats">
            <div className="analytics-stat-card" style={{ borderTopColor: '#6c63ff' }}>
              <div className="asv">{entries.length}</div>
              <div className="asl">Total Entries</div>
            </div>
            <div className="analytics-stat-card" style={{ borderTopColor: '#10b981' }}>
              <div className="asv">{entries[0]?.loggedOn}</div>
              <div className="asl">Last Logged</div>
            </div>
            <div className="analytics-stat-card" style={{ borderTopColor: '#f59e0b' }}>
              <div className="asv">{(() => {
                const days = new Set(entries.map(e => e.loggedOn)).size;
                return `${days} days`;
              })()}</div>
              <div className="asl">Days Tracked</div>
            </div>
            {fields.find(f => f.type === 'number') && (() => {
              const nf = fields.find(f => f.type === 'number');
              const vals = entries.map(e => Number(e.parsedData[nf.name])).filter(v => v > 0);
              return vals.length > 0 ? (
                <div className="analytics-stat-card" style={{ borderTopColor: '#ef4444' }}>
                  <div className="asv">{(vals.reduce((s,v) => s+v, 0) / vals.length).toFixed(1)}</div>
                  <div className="asl">Avg {nf.label}</div>
                </div>
              ) : null;
            })()}
          </div>

          {/* Entry trend */}
          {entryTrendChart && (
            <div className="chart-card" style={{ marginBottom: 16 }}>
              <h3 className="chart-title">📈 Entries Over Time</h3>
              <div style={{ height: 180 }}>
                <Line data={entryTrendChart} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }} />
              </div>
            </div>
          )}

          {/* Per-field charts */}
          {fieldCharts.length > 0 && (
            <div className="field-charts-grid">
              {fieldCharts.map(fc => (
                <div key={fc.field.name} className="chart-card">
                  {fc.type === 'number' && (
                    <>
                      <h3 className="chart-title">📊 {fc.field.label}</h3>
                      <div className="field-stats-row">
                        <span className="field-stat">Avg <strong>{fc.avg}</strong></span>
                        <span className="field-stat">Max <strong>{fc.max}</strong></span>
                        <span className="field-stat">Min <strong>{fc.min}</strong></span>
                      </div>
                      <div style={{ height: 160 }}>
                        <Bar data={fc.chart} options={{
                          responsive: true, maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: { y: { beginAtZero: true } }
                        }} />
                      </div>
                    </>
                  )}
                  {fc.type === 'dropdown' && (
                    <>
                      <h3 className="chart-title">🥧 {fc.field.label} Distribution</h3>
                      <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Doughnut data={fc.chart} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                      </div>
                    </>
                  )}
                  {fc.type === 'boolean' && (
                    <>
                      <h3 className="chart-title">✅ {fc.field.label}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 120, height: 120 }}>
                          <Doughnut data={fc.chart} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '70%' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{fc.pct}%</div>
                          <div style={{ fontSize: 12, color: '#888' }}>Yes rate</div>
                          <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>{fc.yes} yes · {fc.no} no</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Entries Table */}
      <div className="chart-card" style={{ marginTop: 16 }}>
        <h3 className="chart-title">📋 All Entries</h3>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>No entries yet. Log your first one above!</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {fields.map(f => <th key={f.name}>{f.label}</th>)}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id}>
                    <td>{e.loggedOn}</td>
                    {fields.map(f => (
                      <td key={f.name}>
                        {f.type === 'boolean'
                          ? (e.parsedData[f.name] ? '✅' : '❌')
                          : (e.parsedData[f.name] || '—')}
                      </td>
                    ))}
                    <td><button className="btn-delete" onClick={() => handleDelete(e.id)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AiBot pageType="dashboard"
        getData={() => ({ moduleName: module?.name, totalEntries: module?.totalEntries, fields: fields.map(f => f.label), recentEntries: entries.slice(0, 5).map(e => e.parsedData) })} />
    </div>
  );
}
