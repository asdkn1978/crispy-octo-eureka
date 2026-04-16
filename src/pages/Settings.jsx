import { useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Save, User, Mail, Phone, Lock } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');

  async function saveProfile() {
    const res = await api('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ full_name: name, phone }) });
    if (res.success) {
      const u = { ...user, full_name: name, phone };
      localStorage.setItem('ac_user', JSON.stringify(u));
      setMsg('Profil disimpan ✅');
    } else setMsg(res.error || 'Gagal');
    setTimeout(() => setMsg(''), 3000);
  }

  async function changePassword() {
    const res = await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ old_password: oldPw, new_password: newPw }) });
    setMsg(res.success ? 'Password diubah ✅' : (res.error || 'Gagal'));
    setOldPw(''); setNewPw('');
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>Pengaturan</h1>
      {msg && <div style={{ padding: 12, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 10, color: '#22C55E', fontSize: 13, marginBottom: 20 }}>{msg}</div>}

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: '#f1f5f9', fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} color="#22C55E" />Profil</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Email</label>
          <input type="email" value={user?.email || ''} readOnly style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#94a3b8', fontSize: 14 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Nama Lengkap</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14 }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>No. Telepon</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14 }} />
        </div>
        <button onClick={saveProfile} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}><Save size={16} />Simpan</button>
      </div>

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
        <h3 style={{ color: '#f1f5f9', fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={18} color="#22C55E" />Ubah Password</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Password Lama</label>
          <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14 }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Password Baru</label>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={{ width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14 }} />
        </div>
        <button onClick={changePassword} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}><Save size={16} />Ubah Password</button>
      </div>
    </div>
  );
}
