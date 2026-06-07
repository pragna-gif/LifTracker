import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import api from '../api/axios';
import AiBot from '../components/AiBot';
import './Page.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const PLATFORMS = ['LeetCode', 'GFG', 'Codeforces', 'HackerRank'];
const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'DP', 'Backtracking', 'Sorting', 'Binary Search', 'Hashing', 'Heap', 'Other'];
const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

export default function DSA() {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ title: '', platform: 'LeetCode', difficulty: 'Medium', topic: 'Arrays', timeTaken: '', notes: '', solvedOn: '' });

  const fetchAll = async () => {
    const [p, s] = await Promise.all([api.get('/dsa'), api.get('/dsa/stats')]);
    setProblems(p.data);
    setStats(s.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/dsa', { ...form, timeTaken: form.timeTaken ? parseInt(form.timeTaken) : null });
    setForm({ title: '', platform: 'LeetCode', difficulty: 'Medium', topic: 'Arrays', timeTaken: '', notes: '', solvedOn: '' });
    fetchAll();
  };

  const topicBar = stats?.byTopic ? {
    labels: Object.keys(stats.byTopic),
    datasets: [{ label: 'Solved', data: Object.values(stats.byTopic).map(Number), backgroundColor: '#6c63ff', borderRadius: 6 }]
  } : null;

  const diffDoughnut = stats?.byDifficulty ? {
    labels: Object.keys(stats.byDifficulty),
    datasets: [{ data: Object.values(stats.byDifficulty).map(Number),
      backgroundColor: Object.keys(stats.byDifficulty).map(k => DIFF_COLORS[k] || '#aaa'), borderWidth: 0 }]
  } : null;

  return (
    <div className="page">
      <h1 className="page-title">🧠 DSA Tracker</h1>
      <p className="page-sub">Total solved: <strong>{stats?.total || 0}</strong> problems</p>

      <form className="add-form" onSubmit={handleSubmit}>
        <input className="form-input" placeholder="Problem title" value={form.title}
          onChange={e => setForm({...form, title: e.target.value})} required />
        <select className="form-input" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="form-input" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
          {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className="form-input" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}>
          {TOPICS.map(t => <option key={t}>{t}</option>)}
        </select>
        <input className="form-input" type="number" placeholder="Time (mins)" value={form.timeTaken}
          onChange={e => setForm({...form, timeTaken: e.target.value})} />
        <input className="form-input" type="date" value={form.solvedOn}
          onChange={e => setForm({...form, solvedOn: e.target.value})} />
        <button className="btn-primary" type="submit">+ Log Problem</button>
      </form>

      <div className="charts-grid" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: 24 }}>
        {topicBar && (
          <div className="chart-card">
            <h3 className="chart-title">By Topic</h3>
            <div style={{ height: 220 }}>
              <Bar data={topicBar} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
            </div>
          </div>
        )}
        {diffDoughnut && (
          <div className="chart-card">
            <h3 className="chart-title">By Difficulty</h3>
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut data={diffDoughnut} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        )}
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Recent Problems</h3>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Title</th><th>Platform</th><th>Difficulty</th><th>Topic</th><th>Time</th></tr></thead>
          <tbody>
            {problems.slice(0, 10).map(p => (
              <tr key={p.id}>
                <td>{p.solvedOn}</td>
                <td><strong>{p.title}</strong></td>
                <td>{p.platform}</td>
                <td><span className="tag" style={{ background: DIFF_COLORS[p.difficulty] + '22', color: DIFF_COLORS[p.difficulty] }}>{p.difficulty}</span></td>
                <td>{p.topic}</td>
                <td>{p.timeTaken ? `${p.timeTaken}m` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AiBot pageType="dsa" getData={() => stats} />
    </div>
  );
}
