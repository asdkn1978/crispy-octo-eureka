import { useState, useEffect } from 'react';
import api, { getUser } from '../api';
import { Shield, CheckCircle, XCircle, Users, Wallet, RefreshCw } from 'lucide-react';

const BASE = '';

async function adminApi(path, opts = {}) {
  const token = localStorage.getItem('ac_admin_token');
  const res = await fetch(BASE + path, { ...opts, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, ...(opts.headers || {}) } });
  return res.json();
}

export default function Admin() {
  const [email, setEmail] = useState('andra.sadikin@gmail.com');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('ac_admin_token'));
  const [tab, setTab] = useState('topups');
  const [topups, setTopups] = useState([]);
  const [users, setUsers] = useState([]);
  const [manualTopup, setManualTopup] = useState({ userId: '', amount: '' });
  const [error, setError] = useState('');

  async function login(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.data?.user?.role === 'admin') {
        localStorage.setItem('ac_admin_token', data.data.token);
        setLoggedIn(true);
      } else {
        setError(data.error || 'Login gagal. Pastikan akun admin.');
      }
    } catch { setError('Koneksi gagal'); }
  }

  function logout() {
    localStorage.removeItem('ac_admin_token');
    setLoggedIn(false);
  }

  async function loadTopups() { const r = await adminApi('/api/admin/pending-topups'); if (r.success) setTopups(r.data); }
  async function loadUsers() { const r = await adminApi('/api/admin/users'); if (r.success) setUsers(r.data); }

  useEffect(() => { if (loggedIn) { loadTopups(); loadUsers(); } }, [loggedIn]);

  async function approve(id) { await adminApi('/api/admin/approve-topup/' + id, { method: 'POST' }); loadTopups(); loadUsers(); }
  async function reject(id) { await adminApi('/api/admin/reject-topup/' + id, { method: 'POST' }); loadTopups(); }

  async function adminTopup() {
    const userId = parseInt(manualTopup.userId);
    const amount = parseInt(manualTopup.amount);
    if (!userId || !amount) return;
    await adminApi('/api/admin/topup/' + userId, { method: 'POST', body: JSON.stringify({ amount, description: 'Admin manual topup' }) });
    setManualTopup({ userId: '', amount: '' });
    loadUsers();
  }

  if (!loggedIn) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e' }}>
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 32, width: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}><Shield size={24} color="#22C55E" /><h2 style={{ color: '#f1f5f9', fontSize: 18 }}>Admin Login</h2></div>
        <form onSubmit={login}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, marginBottom: 12 }} />
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, marginBottom: 8 }} />
          {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: 10, background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>Login</button>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Admin Panel</h1>
        <button onClick={logout} style={{ padding: '8px 16px', background: 'rgba(239,68,68,.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Logout</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['topups', 'Pending Top-Up', Wallet], ['users', 'Users', Users], ['manual', 'Manual Top-Up', RefreshCw]].map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: tab === id ? 'rgba(34,197,94,.1)' : '#111827', border: tab === id ? '1px solid #22C55E' : '1px solid #1e293b', color: tab === id ? '#22C55E' : '#94a3b8', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}><Icon size={16} />{label}</button>
        ))}
      </div>

      {tab === 'topups' && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#f1f5f9' }}>Pending Top-Up ({topups.length})</h3>
            <button onClick={() => { loadTopups(); loadUsers(); }} style={{ padding: '6px 12px', background: '#111827', border: '1px solid #1e293b', color: '#94a3b8', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Refresh</button>
          </div>
          {topups.length === 0 ? <p style={{ padding: 24, color: '#94a3b8', textAlign: 'center' }}>Tidak ada pending top-up 🎉</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['User', 'Email', 'Jumlah', 'Ref ID', 'Tanggal', 'Aksi'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Aksi' ? 'center' : 'left', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{topups.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '10px 16px', color: '#f1f5f9', fontSize: 13 }}>{t.full_name || '-'}</td>
                    <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: 13 }}>{t.email}</td>
                    <td style={{ padding: '10px 16px', color: '#22C55E', fontWeight: 600, fontSize: 13 }}>Rp{Number(t.amount).toLocaleString('id-ID')}</td>
                    <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: 12 }}>{t.reference_id}</td>
                    <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: 12 }}>{new Date(t.created_at).toLocaleString('id-ID')}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <button onClick={() => approve(t.id)} title="Approve" style={{ padding: '6px 10px', background: 'rgba(34,197,94,.15)', color: '#22C55E', border: 'none', borderRadius: 6, cursor: 'pointer', marginRight: 6 }}><CheckCircle size={14} /></button>
                      <button onClick={() => reject(t.id)} title="Reject" style={{ padding: '6px 10px', background: 'rgba(239,68,68,.15)', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer' }}><XCircle size={14} /></button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}><h3 style={{ color: '#f1f5f9' }}>All Users ({users.length})</h3></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #1e293b' }}>
                {['ID', 'Nama', 'Email', 'Role', 'Saldo', 'Terdaftar'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: 12 }}>#{u.id}</td>
                  <td style={{ padding: '10px 16px', color: '#f1f5f9', fontSize: 13 }}>{u.full_name || '-'}</td>
                  <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '10px 16px' }}><span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, background: u.role === 'admin' ? 'rgba(168,85,247,.15)' : 'rgba(34,197,94,.15)', color: u.role === 'admin' ? '#a855f7' : '#22C55E' }}>{u.role}</span></td>
                  <td style={{ padding: '10px 16px', color: '#22C55E', fontWeight: 600, fontSize: 13 }}>Rp{Number(u.balance).toLocaleString('id-ID')}</td>
                  <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'manual' && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, maxWidth: 400 }}>
          <h3 style={{ color: '#f1f5f9', marginBottom: 16 }}>Manual Top-Up</h3>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>User ID</label>
          <input type="number" value={manualTopup.userId} onChange={e => setManualTopup({ ...manualTopup, userId: e.target.value })} placeholder="1" style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, marginBottom: 12 }} />
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Jumlah (Rp)</label>
          <input type="number" value={manualTopup.amount} onChange={e => setManualTopup({ ...manualTopup, amount: e.target.value })} placeholder="100000" style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, marginBottom: 16 }} />
          <button onClick={adminTopup} style={{ padding: '10px 24px', background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>Top Up</button>
        </div>
      )}
    </div>
  );
}
