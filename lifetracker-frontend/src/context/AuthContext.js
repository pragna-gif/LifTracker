import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lt_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('lt_token', res.data.token);
    localStorage.setItem('lt_user', JSON.stringify({ name: res.data.name, email }));
    setUser({ name: res.data.name, email });
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('lt_token', res.data.token);
    localStorage.setItem('lt_user', JSON.stringify({ name: res.data.name, email }));
    setUser({ name: res.data.name, email });
  };

  const logout = () => {
    localStorage.removeItem('lt_token');
    localStorage.removeItem('lt_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
