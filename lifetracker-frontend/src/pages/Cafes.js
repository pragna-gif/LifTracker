import { useEffect, useState } from 'react';
import api from '../api/axios';
import AiBot from '../components/AiBot';
import './Page.css';

const Stars = ({ n }) => '★'.repeat(n || 0) + '☆'.repeat(5 - (n || 0));

export default function Cafes() {
  const [cafes, setCafes] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL | WORK | WISHLIST
  const [form, setForm] = useState({ name: '', location: '', city: '', wifiRating: 3, coffeeRating: 3, ambienceRating: 3, workFriendly: false, notes: '', wishlist: false, visitedOn: '' });

  const fetchAll = async () => {
    const res = await api.get('/cafes');
    setCafes(res.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/cafes', form);
    setForm({ name: '', location: '', city: '', wifiRating: 3, coffeeRating: 3, ambienceRating: 3, workFriendly: false, notes: '', wishlist: false, visitedOn: '' });
    fetchAll();
  };

  const handleDelete = async (id) => { await api.delete(`/cafes/${id}`); fetchAll(); };

  const filtered = filter === 'WORK' ? cafes.filter(c => c.workFriendly) :
                   filter === 'WISHLIST' ? cafes.filter(c => c.wishlist) : cafes;

  return (
    <div className="page">
      <h1 className="page-title">☕ Café Explorer</h1>
      <p className="page-sub">{cafes.filter(c => !c.wishlist).length} visited · {cafes.filter(c => c.wishlist).length} on wishlist</p>

      <form className="add-form" onSubmit={handleSubmit}>
        <input className="form-input" placeholder="Café name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input className="form-input" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
        <input className="form-input" placeholder="Location / address" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 12 }}>WiFi</label>
          <input className="form-input" type="number" min="1" max="5" style={{ width: 60 }} value={form.wifiRating} onChange={e => setForm({...form, wifiRating: parseInt(e.target.value)})} />
          <label style={{ fontSize: 12 }}>Coffee</label>
          <input className="form-input" type="number" min="1" max="5" style={{ width: 60 }} value={form.coffeeRating} onChange={e => setForm({...form, coffeeRating: parseInt(e.target.value)})} />
          <label style={{ fontSize: 12 }}>Ambience</label>
          <input className="form-input" type="number" min="1" max="5" style={{ width: 60 }} value={form.ambienceRating} onChange={e => setForm({...form, ambienceRating: parseInt(e.target.value)})} />
          <label style={{ fontSize: 12 }}><input type="checkbox" checked={form.workFriendly} onChange={e => setForm({...form, workFriendly: e.target.checked})} /> Work-friendly</label>
          <label style={{ fontSize: 12 }}><input type="checkbox" checked={form.wishlist} onChange={e => setForm({...form, wishlist: e.target.checked})} /> Wishlist</label>
        </div>
        <input className="form-input" type="date" value={form.visitedOn} onChange={e => setForm({...form, visitedOn: e.target.value})} />
        <button className="btn-primary" type="submit">+ Add Café</button>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['ALL', 'WORK', 'WISHLIST'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'btn-primary' : 'btn-outline'} style={{ fontSize: 12 }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {filtered.map(c => (
          <div key={c.id} className="chart-card" style={{ position: 'relative' }}>
            <button className="btn-delete" style={{ position: 'absolute', top: 10, right: 10 }} onClick={() => handleDelete(c.id)}>×</button>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28 }}>{c.wishlist ? '🗺️' : '☕'}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{c.city}{c.location ? ` · ${c.location}` : ''}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 14 }}>
              <div style={{ fontSize: 11 }}><div style={{ color: '#888' }}>WiFi</div><div style={{ color: '#f59e0b' }}><Stars n={c.wifiRating} /></div></div>
              <div style={{ fontSize: 11 }}><div style={{ color: '#888' }}>Coffee</div><div style={{ color: '#f59e0b' }}><Stars n={c.coffeeRating} /></div></div>
              <div style={{ fontSize: 11 }}><div style={{ color: '#888' }}>Ambience</div><div style={{ color: '#f59e0b' }}><Stars n={c.ambienceRating} /></div></div>
            </div>
            {c.workFriendly && <span className="tag" style={{ marginTop: 8, display: 'inline-block', background: '#10b98122', color: '#10b981' }}>💻 Work-friendly</span>}
            {c.notes && <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>{c.notes}</div>}
          </div>
        ))}
      </div>

      <AiBot pageType="cafe" getData={() => ({ total: cafes.length, workFriendly: cafes.filter(c => c.workFriendly).length, wishlist: cafes.filter(c => c.wishlist).length })} />
    </div>
  );
}
