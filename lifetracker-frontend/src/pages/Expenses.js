import { useEffect, useState } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import api from '../api/axios';
import AiBot from '../components/AiBot';
import './Page.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other'];
const COLORS = ['#6c63ff','#f59e0b','#10b981','#ef4444','#3b82f6','#f97316'];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({ amount: '', category: 'Food', note: '', spentOn: '' });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [e, s] = await Promise.all([api.get('/expenses'), api.get('/expenses/summary')]);
    setExpenses(e.data);
    setSummary(s.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/expenses', { ...form, amount: parseFloat(form.amount) });
    setForm({ amount: '', category: 'Food', note: '', spentOn: '' });
    fetchAll();
  };

  const handleDelete = async (id) => {
    await api.delete(`/expenses/${id}`);
    fetchAll();
  };

  const pieData = summary?.byCategory ? {
    labels: Object.keys(summary.byCategory),
    datasets: [{
      data: Object.values(summary.byCategory).map(Number),
      backgroundColor: COLORS,
      borderWidth: 0,
    }]
  } : null;

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <h1 className="page-title">💸 Expenses</h1>
      <p className="page-sub">Total this month: <strong>₹{Number(summary?.total || 0).toLocaleString()}</strong></p>

      {/* Add Form */}
      <form className="add-form" onSubmit={handleSubmit}>
        <input className="form-input" type="number" placeholder="Amount (₹)" value={form.amount}
          onChange={e => setForm({...form, amount: e.target.value})} required />
        <select className="form-input" value={form.category}
          onChange={e => setForm({...form, category: e.target.value})}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input className="form-input" type="text" placeholder="Note (optional)" value={form.note}
          onChange={e => setForm({...form, note: e.target.value})} />
        <input className="form-input" type="date" value={form.spentOn}
          onChange={e => setForm({...form, spentOn: e.target.value})} />
        <button className="btn-primary" type="submit">+ Add</button>
      </form>

      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 28 }}>
        {pieData && (
          <div className="chart-card">
            <h3 className="chart-title">By Category</h3>
            <div style={{ height: 220 }}>
              <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }} />
            </div>
          </div>
        )}
        <div className="chart-card">
          <h3 className="chart-title">Recent Expenses</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th><th></th></tr></thead>
              <tbody>
                {expenses.slice(0, 8).map(e => (
                  <tr key={e.id}>
                    <td>{e.spentOn}</td>
                    <td><span className="tag">{e.category}</span></td>
                    <td><strong>₹{Number(e.amount).toLocaleString()}</strong></td>
                    <td>{e.note || '—'}</td>
                    <td><button className="btn-delete" onClick={() => handleDelete(e.id)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AiBot pageType="expenses" getData={() => ({ summary, recentCount: expenses.length })} />
    </div>
  );
}
