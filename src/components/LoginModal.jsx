import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '114508562779-vnqo2oldbqqsldslroo1c6rm61fpr95a.apps.googleusercontent.com';

export default function LoginModal() {
  const { login, user } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = { email, password };
      if (mode === 'register') { body.full_name = fullName; body.phone = phone; }
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      let res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      res = await res.json();
      if (mode === 'register' && res.success) {
        res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        res = await res.json();
      }
      if (res.success && res.data?.token) { login(res.data.token, res.data.user); }
      else { setError(res.error || 'Gagal'); }
    } catch { setError('Koneksi gagal'); }
    setLoading(false);
  }

  async function handleGoogle(response) {
    try {
      const res = await fetch('/api/auth/google-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: response.credential }) });
      const data = await res.json();
      if (data.success && data.data?.token) login(data.data.token, data.data.user);
      else setError(data.error || 'Google login gagal');
    } catch { setError('Koneksi gagal'); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e', padding: 20 }}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div style={{ background: '#111827', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, border: '1px solid #1e293b' }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 20, marginBottom: 4 }}>{mode === 'login' ? 'Login ke AveraCloud' : 'Buat Akun Baru'}</h2>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 24 }}>{mode === 'login' ? 'Masuk untuk mengelola server kamu' : 'Daftar gratis, langsung aktif'}</p>
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <GoogleLogin onSuccess={handleGoogle} onError={() => setError('Google login gagal')} text={mode === 'login' ? 'signin_with' : 'signup_with'} shape="rectangular" size="large" theme="filled_blue" width="100%" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, color: '#94a3b8', fontSize: 12 }}>── atau ──</div>
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Nama Lengkap</span>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, marginTop: 4 }} />
              </label>
            )}
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Email</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, marginTop: 4 }} />
            </label>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Password</span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, marginTop: 4 }} />
            </label>
            {mode === 'register' && (
              <label style={{ display: 'block', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>No. Telepon</span>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, marginTop: 4 }} />
              </label>
            )}
            {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, fontSize: 14, cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Memuat...' : mode === 'login' ? 'Login' : 'Daftar'}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#94a3b8' }}>
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <a href="#" onClick={e => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} style={{ color: '#22C55E' }}>{mode === 'login' ? 'Daftar' : 'Login'}</a>
          </p>
        </div>
      </GoogleOAuthProvider>
    </div>
  );
}
