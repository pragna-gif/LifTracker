import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV = [
  { to: '/',         icon: '📊', label: 'Dashboard'  },
  { to: '/expenses', icon: '💸', label: 'Expenses'   },
  { to: '/dsa',      icon: '🧠', label: 'DSA'        },
  { to: '/content',  icon: '✍️', label: 'Content'    },
  { to: '/cafes',    icon: '☕', label: 'Cafés'      },
  { to: '/food',     icon: '🍕', label: 'Food'       },
  { to: '/gym',      icon: '💪', label: 'Gym'        },
  { to: '/custom',   icon: '🧩', label: 'My Modules' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-name">LifeTracker</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div className="user-name">{user?.name}</div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
    </aside>
  );
}
