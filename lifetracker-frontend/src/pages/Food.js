import { useEffect, useState } from 'react';
import api from '../api/axios';
import AiBot from '../components/AiBot';
import './Page.css';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const TYPE_COLORS = { Breakfast: '#f59e0b', Lunch: '#10b981', Dinner: '#6c63ff', Snack: '#f97316' };

export default function Food() {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ meal: '', mealType: 'Lunch', calories: '', restaurant: '', homeCooked: false, cuisine: '', rating: 3, loggedOn: '' });

  const fetchAll = async () => { const res = await api.get('/food'); setLogs(res.data); };
  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/food', { ...form, calories: form.calories ? parseInt(form.calories) : null, rating: parseInt(form.rating) });
    setForm({ meal: '', mealType: 'Lunch', calories: '', restaurant: '', homeCooked: false, cuisine: '', rating: 3, loggedOn: '' });
    fetchAll();
  };

  const handleDelete = async (id) => { await api.delete(`/food/${id}`); fetchAll(); };

  const totalCaloriesToday = logs.filter(l => l.loggedOn === new Date().toISOString().split('T')[0]).reduce((s, l) => s + (l.calories || 0), 0);

  return (
    <div className="page">
      <h1 className="page-title">🍕 Food Log</h1>
      <p className="page-sub">Calories today: <strong>{totalCaloriesToday} kcal</strong></p>

      <form className="add-form" onSubmit={handleSubmit}>
        <input className="form-input" placeholder="What did you eat?" value={form.meal}
          onChange={e => setForm({...form, meal: e.target.value})} required style={{ flex: 2 }} />
        <select className="form-input" value={form.mealType} onChange={e => setForm({...form, mealType: e.target.value})}>
          {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <input className="form-input" type="number" placeholder="Calories (optional)" value={form.calories}
          onChange={e => setForm({...form, calories: e.target.value})} />
        <input className="form-input" placeholder="Restaurant (if eating out)" value={form.restaurant}
          onChange={e => setForm({...form, restaurant: e.target.value})} />
        <input className="form-input" placeholder="Cuisine (Indian, Italian...)" value={form.cuisine}
          onChange={e => setForm({...form, cuisine: e.target.value})} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12 }}><input type="checkbox" checked={form.homeCooked} onChange={e => setForm({...form, homeCooked: e.target.checked})} /> Home cooked</label>
          <label style={{ fontSize: 12 }}>Rating
            <select style={{ marginLeft: 6, borderRadius: 6, border: '1px solid #e0e0e0', padding: '2px 4px' }} value={form.rating} onChange={e => setForm({...form, rating: e.target.value})}>
              {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <input className="form-input" type="date" value={form.loggedOn} onChange={e => setForm({...form, loggedOn: e.target.value})} />
        <button className="btn-primary" type="submit">+ Log Meal</button>
      </form>

      <div className="chart-card">
        <h3 className="chart-title">Food Log</h3>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Meal</th><th>Type</th><th>Calories</th><th>Restaurant</th><th>Cuisine</th><th></th></tr></thead>
          <tbody>
            {logs.slice(0, 15).map(l => (
              <tr key={l.id}>
                <td>{l.loggedOn}</td>
                <td><strong>{l.meal}</strong></td>
                <td><span className="tag" style={{ background: TYPE_COLORS[l.mealType] + '22', color: TYPE_COLORS[l.mealType] }}>{l.mealType}</span></td>
                <td>{l.calories ? `${l.calories} kcal` : '—'}</td>
                <td>{l.homeCooked ? '🏠 Home' : (l.restaurant || '—')}</td>
                <td>{l.cuisine || '—'}</td>
                <td><button className="btn-delete" onClick={() => handleDelete(l.id)}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AiBot pageType="food" getData={() => ({ totalLogged: logs.length, caloriesToday: totalCaloriesToday, recentMeals: logs.slice(0, 5).map(l => l.meal) })} />
    </div>
  );
}
