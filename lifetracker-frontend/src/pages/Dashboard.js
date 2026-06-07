import { useEffect, useState } from 'react';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import AiBot from '../components/AiBot';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CHART_COLORS = ['#6c63ff','#f59e0b','#10b981','#ef4444','#3b82f6','#f97316','#8b5cf6','#ec4899'];

export default function Dashboard() {
  const [summary, setSummary]           = useState(null);
  const [expenseSummary, setExpense]    = useState(null);
  const [dsaStats, setDsa]              = useState(null);
  const [gymStats, setGym]              = useState(null);
  const [contentStats, setContent]      = useState(null);
  const [customModules, setCustom]      = useState([]);
  const [foodLogs, setFood]             = useState([]);
  const [cafes, setCafes]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/expenses/summary'),
      api.get('/dsa/stats'),
      api.get('/gym/stats'),
      api.get('/content/stats'),
      api.get('/custom/modules'),
      api.get('/food'),
      api.get('/cafes'),
    ]).then(([s, e, d, g, c, cm, f, ca]) => {
      setSummary(s.data);
      setExpense(e.data);
      setDsa(d.data);
      setGym(g.data);
      setContent(c.data);
      setCustom(cm.data);
      setFood(f.data);
      setCafes(ca.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  // ── Chart data ────────────────────────────────────────────────────────────
  const expensePie = expenseSummary?.byCategory && Object.keys(expenseSummary.byCategory).length > 0 ? {
    labels: Object.keys(expenseSummary.byCategory),
    datasets: [{ data: Object.values(expenseSummary.byCategory).map(Number), backgroundColor: CHART_COLORS, borderWidth: 0 }]
  } : null;

  const dsaBar = dsaStats?.byTopic && Object.keys(dsaStats.byTopic).length > 0 ? {
    labels: Object.keys(dsaStats.byTopic),
    datasets: [{ label: 'Solved', data: Object.values(dsaStats.byTopic).map(Number), backgroundColor: '#6c63ff', borderRadius: 6 }]
  } : null;

  const dsaDiffDoughnut = dsaStats?.byDifficulty && Object.keys(dsaStats.byDifficulty).length > 0 ? {
    labels: Object.keys(dsaStats.byDifficulty),
    datasets: [{ data: Object.values(dsaStats.byDifficulty).map(Number),
      backgroundColor: { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' },
      borderWidth: 0 }]
  } : null;

  const gymBar = gymStats?.muscleGroups && Object.keys(gymStats.muscleGroups).length > 0 ? {
    labels: Object.keys(gymStats.muscleGroups),
    datasets: [{ label: 'Sessions', data: Object.values(gymStats.muscleGroups).map(Number), backgroundColor: '#ef4444', borderRadius: 6 }]
  } : null;

  const contentPie = contentStats?.byPlatform && Object.keys(contentStats.byPlatform).length > 0 ? {
    labels: Object.keys(contentStats.byPlatform),
    datasets: [{ data: Object.values(contentStats.byPlatform).map(Number), backgroundColor: CHART_COLORS, borderWidth: 0 }]
  } : null;

  const contentStatusBar = contentStats?.byStatus && Object.keys(contentStats.byStatus).length > 0 ? {
    labels: Object.keys(contentStats.byStatus),
    datasets: [{ label: 'Items', data: Object.values(contentStats.byStatus).map(Number),
      backgroundColor: ['#f59e0b','#3b82f6','#8b5cf6','#10b981'], borderRadius: 6 }]
  } : null;

  const todayStr = new Date().toISOString().split('T')[0];
  const caloriesToday = foodLogs.filter(l => l.loggedOn === todayStr).reduce((s, l) => s + (l.calories || 0), 0);
  const homeCookedPct = foodLogs.length > 0
    ? Math.round((foodLogs.filter(l => l.homeCooked).length / foodLogs.length) * 100) : 0;

  const mealTypePie = foodLogs.length > 0 ? (() => {
    const counts = foodLogs.reduce((acc, l) => { acc[l.mealType] = (acc[l.mealType] || 0) + 1; return acc; }, {});
    return { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ['#f59e0b','#10b981','#6c63ff','#f97316'], borderWidth: 0 }] };
  })() : null;

  const workFriendlyCafes = cafes.filter(c => c.workFriendly).length;

  return (
    <div className="page">
      <h1 className="page-title">Good morning, {summary?.userName?.split(' ')[0]} 👋</h1>
      <p className="page-sub">Here's your life at a glance</p>

      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        <StatCard icon="💸" label="Spent this month"    value={`₹${Number(summary?.monthlyExpenses || 0).toLocaleString()}`} color="#f59e0b" />
        <StatCard icon="🧠" label="DSA Solved"          value={summary?.totalDsaSolved}        sub={`${summary?.dsaThisWeek} this week`} color="#6c63ff" />
        <StatCard icon="✍️" label="Published Content"   value={summary?.publishedContent}       color="#10b981" />
        <StatCard icon="💪" label="Gym Sessions"        value={summary?.gymSessionsThisMonth}   sub="this month"   color="#ef4444" />
        <StatCard icon="🍕" label="Calories today"      value={`${caloriesToday} kcal`}         sub={`${homeCookedPct}% home cooked`} color="#f97316" />
        <StatCard icon="☕" label="Cafés visited"       value={cafes.filter(c=>!c.wishlist).length} sub={`${workFriendlyCafes} work-friendly`} color="#8b5cf6" />
        <StatCard icon="📝" label="Food entries"        value={foodLogs.length}                 sub="total logged"  color="#ec4899" />
        <StatCard icon="🧩" label="Custom Modules"      value={customModules.length}            sub="active trackers" color="#3b82f6" />
      </div>

      {/* ── Section: Expenses + DSA ── */}
      <div className="section-divider">💸 Expenses & 🧠 DSA</div>
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        {expensePie ? (
          <div className="chart-card">
            <h3 className="chart-title">💸 Expenses by Category</h3>
            <div className="chart-wrap"><Pie data={expensePie} options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }} /></div>
          </div>
        ) : <EmptyChart label="💸 No expenses logged yet" />}

        {dsaBar ? (
          <div className="chart-card">
            <h3 className="chart-title">🧠 DSA by Topic</h3>
            <div className="chart-wrap"><Bar data={dsaBar} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
          </div>
        ) : <EmptyChart label="🧠 No DSA problems logged yet" />}

        {dsaDiffDoughnut ? (
          <div className="chart-card">
            <h3 className="chart-title">🧠 DSA Difficulty</h3>
            <div className="chart-wrap"><Doughnut data={dsaDiffDoughnut} options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }} /></div>
          </div>
        ) : <EmptyChart label="🧠 No difficulty data yet" />}
      </div>

      {/* ── Section: Gym + Content ── */}
      <div className="section-divider">💪 Gym & ✍️ Content</div>
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        {gymBar ? (
          <div className="chart-card">
            <h3 className="chart-title">💪 Muscle Groups</h3>
            <div className="chart-wrap"><Bar data={gymBar} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
          </div>
        ) : <EmptyChart label="💪 No gym sessions logged yet" />}

        {contentPie ? (
          <div className="chart-card">
            <h3 className="chart-title">✍️ Content by Platform</h3>
            <div className="chart-wrap"><Pie data={contentPie} options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }} /></div>
          </div>
        ) : <EmptyChart label="✍️ No content logged yet" />}

        {contentStatusBar ? (
          <div className="chart-card">
            <h3 className="chart-title">✍️ Content Pipeline</h3>
            <div className="chart-wrap"><Bar data={contentStatusBar} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
          </div>
        ) : <EmptyChart label="✍️ No pipeline data yet" />}
      </div>

      {/* ── Section: Food ── */}
      <div className="section-divider">🍕 Food & ☕ Cafés</div>
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {mealTypePie ? (
          <div className="chart-card">
            <h3 className="chart-title">🍕 Meals by Type</h3>
            <div className="chart-wrap"><Pie data={mealTypePie} options={{ plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }} /></div>
          </div>
        ) : <EmptyChart label="🍕 No food logged yet" />}

        <div className="chart-card">
          <h3 className="chart-title">☕ Café Stats</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '8px 0' }}>
            {[
              { label: 'Total Visited', val: cafes.filter(c=>!c.wishlist).length, color: '#8b5cf6' },
              { label: 'Work-friendly', val: workFriendlyCafes, color: '#10b981' },
              { label: 'On Wishlist',   val: cafes.filter(c=>c.wishlist).length, color: '#f59e0b' },
              { label: 'Avg Coffee ★', val: cafes.length ? (cafes.reduce((s,c)=>s+(c.coffeeRating||0),0)/cafes.length).toFixed(1) : '—', color: '#ef4444' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ flex: 1, minWidth: 100, background: color+'15', borderRadius: 10, padding: '12px 14px', borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: 22, fontWeight: 800, color }}>{val}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section: Custom Modules ── */}
      {customModules.length > 0 && (
        <>
          <div className="section-divider">🧩 My Custom Modules</div>
          <div className="custom-modules-grid">
            {customModules.map(m => (
              <div key={m.id} className="custom-module-dash-card" onClick={() => navigate(`/custom/${m.id}`)}>
                <span style={{ fontSize: 28 }}>{m.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                  {m.description && <div style={{ fontSize: 11, color: '#888' }}>{m.description}</div>}
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6c63ff', fontWeight: 600 }}>View →</span>
              </div>
            ))}
          </div>
        </>
      )}

      <AiBot pageType="dashboard" getData={() => summary} />
    </div>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="chart-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ccc', fontSize: 13, textAlign: 'center' }}>{label}</div>
    </div>
  );
}
