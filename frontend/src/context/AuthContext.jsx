import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/endpoints';
import { TOKEN_KEY } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authApi.me().then((r) => setUser(r.data)).catch(logout).finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('agileflow:unauthorized', logout);
    return () => window.removeEventListener('agileflow:unauthorized', logout);
  }, [logout]);

  const handleAuth = (res) => {
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
  };
  const login = async (email, password) => handleAuth(await authApi.login({ email, password }));
  const register = async (name, email, password) => handleAuth(await authApi.register({ name, email, password }));

  return <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
