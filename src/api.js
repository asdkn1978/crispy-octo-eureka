const API_BASE = '';
export default async function api(path, opts = {}) {
  const token = localStorage.getItem('ac_token');
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { ...opts, headers });
  if (res.status === 401) { localStorage.removeItem('ac_token'); localStorage.removeItem('ac_user'); window.location.href = '/dashboard'; return {}; }
  return res.json();
}
export function getUser() { try { return JSON.parse(localStorage.getItem('ac_user')); } catch { return null; } }
