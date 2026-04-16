import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Server, Wallet, CreditCard, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ servers: 0, active: 0, balance: 0, monthly: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [servers, wallet] = await Promise.all([api('/api/vps'), api('/api/wallet')]);
        setStats({
          servers: servers.data?.length || 0,
          active: servers.data?.filter(s => s.status === 'running').length || 0,
          balance: wallet.data?.balance || 0,
          monthly: 0
        });
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'Total Server', value: stats.servers, icon: Server, color: '#22C55E' },
    { label: 'Server Aktif', value: stats.active, icon: Activity, color: '#3b82f6' },
    { label: 'Wallet Balance', value: `Rp${Number(stats.balance).toLocaleString('id-ID')}`, icon: Wallet, color: '#f59e0b' },
    { label: 'Bulanan', value: `Rp${stats.monthly.toLocaleString('id-ID')}`, icon: CreditCard, color: '#a855f7' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><c.icon size={20} color={c.color} /><span style={{ color: '#94a3b8', fontSize: 13 }}>{c.label}</span></div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{loading ? '...' : c.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
        <h3 style={{ color: '#f1f5f9', fontSize: 16, marginBottom: 16 }}>Selamat Datang, {user?.full_name || user?.email}! 👋</h3>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Kamu belum memiliki server. <a href="/servers" style={{ color: '#22C55E' }}>Buat server pertamamu →</a></p>
      </div>
    </div>
  );
}
