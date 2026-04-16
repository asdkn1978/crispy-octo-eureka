import { createContext, useContext, useState, useEffect } from 'react';
import { getUser } from './api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => { setUser(getUser()); }, []);
  const login = (token, u) => { localStorage.setItem('ac_token', token); localStorage.setItem('ac_user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem('ac_token'); localStorage.removeItem('ac_user'); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
