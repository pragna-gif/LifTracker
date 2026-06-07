import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';
import AiBot from '../components/AiBot';
import './Page.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PLATFORMS = ['YouTube', 'Blog', 'LinkedIn', 'Twitter', 'Instagram'];
const STATUSES = ['IDEA', 'DRAFTING', 'REVIEW', 'PUBLISHED'];
const STATUS_COLORS = { IDEA: '#f59e0b', DRAFTING: '#3b82f6', REVIEW: '#8b5cf6', PUBLISHED: '#10b981' };

export default function Content() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [form, setForm] = useState({ title: '', platform: 'YouTube', status: 'IDEA', tags: '' });

  const fetchAll = async () => {
    const [i, s] = await Promise.all([api.get('/content'), api.get('/content/stats')]);
    setItems(i.data);
    setStats(s.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/content', form);
    setForm({ title: '', platform: 'YouTube', status: 'IDEA', tags: '' });
    fetchAll();
  };

  const handleStatusChange = async (id, status) => {
    await api.patch(`/content/${id}/status?status=${status}`);
    fetchAll();
  };

  const platformChart = stats?.byPlatform ? {
    labels: Object.keys(stats.byPlatform),
    datasets: [{ data: Object.values(stats.byPlatform).map(Number),
      backgroundColor: ['#ef4444','#3b82f6','#0ea5e9','#1d4ed8','#f97316'], borderWidth: 0 }]
  } : null;

  const filtered = filter === 'ALL' ? items : items.filter(i => i.status === filter);

  return (
    <div className="page">
      <h1 className="page-title">✍️ Content Pipeline</h1>
      <p className="page-sub">Published: <strong>{stats?.published || 0}</strong> pieces</p>

      <form className="add-form" onSubmit={handleSubmit}>
        <input className="form-input" placeholder="Content title / idea" value={form.title}
          onChange={e => setForm({...form, title: e.target.value})} required style={{ flex: 2 }} />
        <select className="form-input" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <input className="form-input" placeholder="Tags (comma separated)" value={form.tags}
          onChange={e => setForm({...form, tags: e.target.value})} />
        <button className="btn-primary" type="submit">+ Add</button>
      </form>

      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 2fr', marginBottom: 24 }}>
        {platformChart && (
          <div className="chart-card">
            <h3 className="chart-title">By Platform</h3>
            <div style={{ height: 200 }}>
              <Doughnut data={platformChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        )}
        <div className="chart-card">
          <h3 className="chart-title">Kanban Pipeline</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {STATUSES.map(s => (
              <div key={s} style={{ flex: 1, background: STATUS_COLORS[s] + '15', borderRadius: 10, padding: 10, borderTop: `3px solid ${STATUS_COLORS[s]}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[s], marginBottom: 8 }}>{s} ({items.filter(i => i.status === s).length})</div>
                {items.filter(i => i.status === s).slice(0, 3).map(i => (
                  <div key={i.id} style={{ fontSize: 11, background: '#fff', borderRadius: 6, padding: '6px 8px', marginBottom: 4 }}>{i.title}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {['ALL', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={filter === s ? 'btn-primary' : 'btn-outline'}
              style={{ fontSize: 12, padding: '4px 12px' }}>{s}</button>
          ))}
        </div>
        <table className="data-table">
          <thead><tr><th>Title</th><th>Platform</th><th>Status</th><th>Tags</th><th>Move to</th></tr></thead>
          <tbody>
            {filtered.slice(0, 10).map(item => (
              <tr key={item.id}>
                <td><strong>{item.title}</strong></td>
                <td>{item.platform}</td>
                <td><span className="tag" style={{ background: STATUS_COLORS[item.status] + '22', color: STATUS_COLORS[item.status] }}>{item.status}</span></td>
                <td style={{ fontSize: 11 }}>{item.tags || '—'}</td>
                <td>
                  <select style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6, border: '1px solid #e0e0e0' }}
                    value={item.status} onChange={e => handleStatusChange(item.id, e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AiBot pageType="content" getData={() => stats} />
    </div>
  );
}
