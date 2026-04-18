import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';
import { Server, Wallet, CreditCard, Activity, Cpu, HardDrive } from 'lucide-react';

const planMeta = {
  starter_s: { cpu: '2 Core', ram: '2 GB', storage: '40 GB', price: 50000 },
  starter_m: { cpu: '2 Core', ram: '2 GB', storage: '50 GB', price: 65000 },
  standard_s: { cpu: '2 Core', ram: '4 GB', storage: '60 GB', price: 80000 },
  standard_m: { cpu: '2 Core', ram: '4 GB', storage: '70 GB', price: 90000 },
  pro_s: { cpu: '2 Core', ram: '8 GB', storage: '80 GB', price: 130000 },
  pro_m: { cpu: '2 Core', ram: '8 GB', storage: '100 GB', price: 160000 },
  enterprise: { cpu: '4 Core', ram: '8 GB', storage: '180 GB', price: 325000 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ servers: 0, active: 0, balance: 0, monthly: 0 });
  const [recentServers, setRecentServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [serversRes, wallet] = await Promise.all([api('/api/vps'), api('/api/wallet')]);
        const list = serversRes.data || serversRes.instances || [];
        const active = list.filter(s => s.status === 'running').length;
        let monthly = 0;
        list.forEach(s => { const m = planMeta[s.plan]; if (m) monthly += m.price; });
        setStats({
          servers: list.length,
          active,
          balance: wallet.balance || wallet.data?.balance || 0,
          monthly,
        });
        setRecentServers(list.slice(0, 5));
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

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#f1f5f9', fontSize: 16 }}>Selamat Datang, {user?.full_name || user?.email}! 👋</h3>
          {stats.servers === 0 && (
            <Link to="/servers" style={{ padding: '8px 16px', background: '#22C55E', color: '#000', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>+ Buat Server</Link>
          )}
        </div>
        {stats.servers === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Kamu belum memiliki server. Mulai dengan membuat server pertamamu!</p>
        ) : (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Kamu memiliki <strong style={{ color: '#f1f5f9' }}>{stats.servers}</strong> server ({stats.active} aktif). Total pengeluaran bulanan: <strong style={{ color: '#22C55E' }}>Rp{stats.monthly.toLocaleString('id-ID')}</strong></p>
        )}
      </div>

      {recentServers.length > 0 && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}>
          <h3 style={{ color: '#f1f5f9', fontSize: 16, marginBottom: 16 }}>Server Terbaru</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentServers.map((s, i) => {
              const meta = planMeta[s.plan] || {};
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0a0f1e', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Cpu size={16} color="#22C55E" />
                    <span style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 500 }}>{s.name || 'Server ' + (i + 1)}</span>
                    {meta.cpu && <span style={{ color: '#64748b', fontSize: 12 }}>{meta.cpu} · {meta.ram} · {meta.storage}</span>}
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: s.status === 'running' ? 'rgba(34,197,94,.15)' : 'rgba(251,191,36,.15)', color: s.status === 'running' ? '#22C55E' : '#fbbf24' }}>{s.status || 'creating'}</span>
                </div>
              );
            })}
          </div>
          <Link to="/servers" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#22C55E', fontSize: 13, textDecoration: 'none' }}>Lihat semua server →</Link>
        </div>
      )}
    </div>
  );
}
