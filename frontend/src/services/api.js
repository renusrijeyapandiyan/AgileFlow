import axios from 'axios';

export const TOKEN_KEY = 'agileflow_token';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8080/api')
  .replace(/\/+$/, '')
  .replace(/\/api$/i, '') + '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/login') || err.config?.url?.startsWith('/auth/register');
    if (err.response?.status === 401 && !isAuthCall) window.dispatchEvent(new Event('agileflow:unauthorized'));
    return Promise.reject(err);
  },
);

/** Extract a human readable message from an Axios error. */
export function errorMessage(err) {
  const data = err?.response?.data;
  if (data?.details && Object.keys(data.details).length) return Object.values(data.details).join('. ');
  if (data?.message) return data.message;
  if (err?.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the backend running?';
  return err?.message || 'Something went wrong';
}
