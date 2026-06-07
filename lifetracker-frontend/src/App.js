import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import DSA from './pages/DSA';
import Content from './pages/Content';
import Cafes from './pages/Cafes';
import Food from './pages/Food';
import Gym from './pages/Gym';
import CustomModules from './pages/CustomModules';
import CustomModuleView from './pages/CustomModuleView';
import Login from './pages/Login';
import './App.css';

function PrivateLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/dsa"      element={<DSA />} />
          <Route path="/content"  element={<Content />} />
          <Route path="/cafes"    element={<Cafes />} />
          <Route path="/food"     element={<Food />} />
          <Route path="/gym"           element={<Gym />} />
          <Route path="/custom"        element={<CustomModules />} />
          <Route path="/custom/:id"    element={<CustomModuleView />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/*"     element={user ? <PrivateLayout /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
