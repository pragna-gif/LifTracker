import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';
import AiBot from '../components/AiBot';
import './Page.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];

export default function Gym() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ exercise: '', muscleGroup: 'Chest', sets: '', reps: '', weightKg: '', durationMin: '', notes: '', workedOutOn: '' });

  const fetchAll = async () => {
    const [s, st] = await Promise.all([api.get('/gym'), api.get('/gym/stats')]);
    setSessions(s.data);
    setStats(st.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/gym', {
      ...form,
      sets: form.sets ? parseInt(form.sets) : null,
      reps: form.reps ? parseInt(form.reps) : null,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      durationMin: form.durationMin ? parseInt(form.durationMin) : null,
    });
    setForm({ exercise: '', muscleGroup: 'Chest', sets: '', reps: '', weightKg: '', durationMin: '', notes: '', workedOutOn: '' });
    fetchAll();
  };

  const muscleBar = stats?.muscleGroups ? {
    labels: Object.keys(stats.muscleGroups),
    datasets: [{ label: 'Sets logged', data: Object.values(stats.muscleGroups).map(Number), backgroundColor: '#ef4444', borderRadius: 6 }]
  } : null;

  return (
    <div className="page">
      <h1 className="page-title">💪 Gym Tracker</h1>
      <p className="page-sub">Sessions this month: <strong>{stats?.recentFrequency || 0}</strong></p>

      <form className="add-form" onSubmit={handleSubmit}>
        <input className="form-input" placeholder="Exercise (e.g. Bench Press)" value={form.exercise}
          onChange={e => setForm({...form, exercise: e.target.value})} required />
        <select className="form-input" value={form.muscleGroup} onChange={e => setForm({...form, muscleGroup: e.target.value})}>
          {MUSCLE_GROUPS.map(m => <option key={m}>{m}</option>)}
        </select>
        <input className="form-input" type="number" placeholder="Sets" value={form.sets} onChange={e => setForm({...form, sets: e.target.value})} />
        <input className="form-input" type="number" placeholder="Reps" value={form.reps} onChange={e => setForm({...form, reps: e.target.value})} />
        <input className="form-input" type="number" step="0.5" placeholder="Weight (kg)" value={form.weightKg} onChange={e => setForm({...form, weightKg: e.target.value})} />
        <input className="form-input" type="date" value={form.workedOutOn} onChange={e => setForm({...form, workedOutOn: e.target.value})} />
        <button className="btn-primary" type="submit">+ Log Session</button>
      </form>

      {muscleBar && (
        <div className="chart-card" style={{ marginBottom: 24 }}>
          <h3 className="chart-title">Muscle Group Breakdown</h3>
          <div style={{ height: 200 }}>
            <Bar data={muscleBar} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      )}

      <div className="chart-card">
        <h3 className="chart-title">Recent Sessions</h3>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Exercise</th><th>Muscle</th><th>Sets</th><th>Reps</th><th>Weight</th></tr></thead>
          <tbody>
            {sessions.slice(0, 10).map(s => (
              <tr key={s.id}>
                <td>{s.workedOutOn}</td>
                <td><strong>{s.exercise}</strong></td>
                <td><span className="tag">{s.muscleGroup}</span></td>
                <td>{s.sets ?? '—'}</td>
                <td>{s.reps ?? '—'}</td>
                <td>{s.weightKg ? `${s.weightKg} kg` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AiBot pageType="gym" getData={() => stats} />
    </div>
  );
}
