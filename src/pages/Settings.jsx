import { useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Save, User, Mail, Phone, Lock, Eye, EyeOff, LogOut } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [saving, setSaving] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  function flash(text, type = 'success') {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await api('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ full_name: name, phone }) });
      if (res.success) {
        const u = { ...user, full_name: name, phone };
        localStorage.setItem('ac_user', JSON.stringify(u));
        flash('Profil disimpan ✅');
      } else flash(res.error || 'Gagal menyimpan profil', 'error');
    } catch { flash('Koneksi gagal', 'error'); }
    setSaving(false);
  }

  async function changePassword() {
    if (newPw.length < 6) { flash('Password baru minimal 6 karakter', 'error'); return; }
    if (newPw !== confirmPw) { flash('Konfirmasi password tidak cocok', 'error'); return; }
    setSaving(true);
    try {
      const res = await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ old_password: oldPw, new_password: newPw }) });
      flash(res.success ? 'Password berhasil diubah ✅' : (res.error || 'Gagal'), res.success ? 'success' : 'error');
      if (res.success) { setOldPw(''); setNewPw(''); setConfirmPw(''); }
    } catch { flash('Koneksi gagal', 'error'); }
    setSaving(false);
  }

  async function handleLogout() { logout(); }

  const inputStyle = { width: '100%', padding: 10, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>Pengaturan</h1>

      {msg && <div style={{ padding: 12, background: msgType === 'success' ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${msgType === 'success' ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`, borderRadius: 10, color: msgType === 'success' ? '#22C55E' : '#ef4444', fontSize: 13, marginBottom: 20 }}>{msg}</div>}

      {/* Profile */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: '#f1f5f9', fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} color="#22C55E" />Profil</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}><Mail size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />Email</label>
          <input type="email" value={user?.email || ''} readOnly style={{ ...inputStyle, color: '#94a3b8' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Nama Lengkap</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Masukkan nama lengkap" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}><Phone size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />No. Telepon</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="08xxxxxxxxxx" />
        </div>
        <button onClick={saveProfile} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, fontSize: 14, cursor: saving ? 'wait' : 'pointer', opacity: saving ? .6 : 1 }}><Save size={16} />{saving ? 'Menyimpan...' : 'Simpan Profil'}</button>
      </div>

      {/* Change Password */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: '#f1f5f9', fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={18} color="#22C55E" />Ubah Password</h3>
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Password Lama</label>
          <input type={showOldPw ? 'text' : 'password'} value={oldPw} onChange={e => setOldPw(e.target.value)} style={inputStyle} placeholder="Password lama" />
          <button type="button" onClick={() => setShowOldPw(!showOldPw)} style={{ position: 'absolute', right: 10, top: 28, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>{showOldPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Password Baru</label>
          <input type={showNewPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle} placeholder="Minimal 6 karakter" />
          <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{ position: 'absolute', right: 10, top: 28, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>{showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Konfirmasi Password Baru</label>
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inputStyle} placeholder="Ulangi password baru" />
        </div>
        <button onClick={changePassword} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, fontSize: 14, cursor: saving ? 'wait' : 'pointer', opacity: saving ? .6 : 1 }}><Lock size={16} />{saving ? 'Mengubah...' : 'Ubah Password'}</button>
      </div>

      {/* Logout */}
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
        <h3 style={{ color: '#f1f5f9', fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><LogOut size={18} color="#ef4444" />Sesi</h3>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Keluar dari akun Anda di perangkat ini.</p>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'rgba(239,68,68,.15)', color: '#ef4444', fontWeight: 600, border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}><LogOut size={16} />Logout</button>
      </div>
    </div>
  );
}
