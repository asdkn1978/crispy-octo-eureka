import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LayoutDashboard, Server, Wallet, Settings, LogOut, Menu, X, Cloud } from 'lucide-react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/servers', icon: Server, label: 'Server' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/settings', icon: Settings, label: 'Pengaturan' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e' }}>
      <aside style={{ width: 240, background: '#111827', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '20px 0', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .3s' }}>
        <div style={{ padding: '0 20px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1e293b', paddingBottom: 16 }}>
          <Cloud size={24} color="#22C55E" /><span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>AveraCloud</span>
        </div>
        <nav style={{ flex: 1, marginTop: 12 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', color: location.pathname === l.to ? '#22C55E' : '#94a3b8', fontSize: 14, textDecoration: 'none', background: location.pathname === l.to ? 'rgba(34,197,94,.08)' : 'transparent', borderLeft: location.pathname === l.to ? '3px solid #22C55E' : '3px solid transparent', transition: 'all .2s' }}>
              <l.icon size={18} />{l.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '0 20px', borderTop: '1px solid #1e293b', paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{user?.email}</div>
          <button onClick={() => { logout(); navigate('/dashboard'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '8px 0' }}><LogOut size={16} />Keluar</button>
        </div>
      </aside>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 40 }} />}
      <main style={{ flex: 1, marginLeft: 240, padding: 24 }}>
        <button onClick={() => setOpen(true)} style={{ display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 30, background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: 8, color: '#f1f5f9', cursor: 'pointer' }} className="mobile-menu-btn"><Menu size={20} /></button>
        {children}
      </main>
      <style>{`@media(max-width:768px){aside{transform:translateX(-100%)}aside.open{transform:translateX(0)}main{margin-left:0!important}.mobile-menu-btn{display:flex!important}}`}</style>
    </div>
  );
}
