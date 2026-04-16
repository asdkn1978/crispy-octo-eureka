import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, RotateCw, Trash2, Server } from 'lucide-react';

const planOptions = [
  { id: 'starter_s', name: 'Starter S', price: 50000 },
  { id: 'starter_m', name: 'Starter M', price: 65000 },
  { id: 'standard_s', name: 'Standard S', price: 80000 },
  { id: 'standard_m', name: 'Standard M', price: 90000 },
  { id: 'pro_s', name: 'Pro S', price: 130000 },
  { id: 'pro_m', name: 'Pro M', price: 160000 },
  { id: 'enterprise', name: 'Enterprise', price: 325000 },
];

export default function Servers() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  async function loadServers() {
    const res = await api('/api/vps');
    setServers(res.data || res.instances || []);
    setLoading(false);
  }

  useEffect(() => { loadServers(); }, []);

  async function handleCreate() {
    if (!selectedPlan) return;
    const p = planOptions.find(x => x.id === selectedPlan);
    const res = await api('/api/vps', { method: 'POST', body: JSON.stringify({ plan_id: selectedPlan, name: p?.name + '-' + Date.now().toString(36) }) });
    setShowCreate(false);
    if (res.success) {
      setServers(prev => [...prev, { name: res.data.name, ip: res.data.ip, plan: selectedPlan, status: res.data.status || 'creating' }]);
    }
    setSelectedPlan('');
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Server Saya</h1>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#22C55E', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}><Plus size={16} />Buat Server</button>
      </div>

      {loading ? <p style={{ color: '#94a3b8' }}>Memuat...</p> : servers.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <Server size={48} color="#1e293b" style={{ marginBottom: 16 }} />
          <h3 style={{ color: '#f1f5f9', marginBottom: 8 }}>Belum ada server</h3>
          <p style={{ color: '#94a3b8', marginBottom: 20 }}>Buat server pertamamu sekarang.</p>
          <button onClick={() => setShowCreate(true)} style={{ padding: '10px 24px', background: '#22C55E', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Buat Server</button>
        </div>
      ) : (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #1e293b' }}>
              {['Nama', 'IP', 'Plan', 'Status', 'Aksi'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>)}
            </tr></thead>
            <tbody>{servers.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 16px', color: '#f1f5f9', fontSize: 14 }}>{s.name || 'Server ' + (i + 1)}</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 13 }}>{s.ip || '-'}</td>
                <td style={{ padding: '12px 16px', color: '#f1f5f9', fontSize: 13 }}>{s.plan || '-'}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: s.status === 'running' ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)', color: s.status === 'running' ? '#22C55E' : '#ef4444' }}>{s.status || 'unknown'}</span></td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                  <button style={{ padding: 6, background: 'rgba(59,130,246,.15)', color: '#3b82f6', border: 'none', borderRadius: 6, cursor: 'pointer' }}><RotateCw size={14} /></button>
                  <button style={{ padding: 6, background: 'rgba(239,68,68,.15)', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer' }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }}>
            <h3 style={{ color: '#f1f5f9', fontSize: 18, marginBottom: 20 }}>Buat Server Baru</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, maxHeight: 300, overflowY: 'auto' }}>
              {planOptions.map(p => (
                <label key={p.id} onClick={() => setSelectedPlan(p.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: selectedPlan === p.id ? 'rgba(34,197,94,.1)' : 'transparent', border: selectedPlan === p.id ? '1px solid #22C55E' : '1px solid #1e293b', borderRadius: 10, cursor: 'pointer' }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: 14 }}>{p.name}</span>
                  <span style={{ color: '#22C55E', fontWeight: 600, fontSize: 14 }}>Rp{p.price.toLocaleString('id-ID')}/bln</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: 10, background: 'transparent', border: '1px solid #1e293b', color: '#f1f5f9', borderRadius: 8, cursor: 'pointer' }}>Batal</button>
              <button onClick={handleCreate} disabled={!selectedPlan} style={{ flex: 1, padding: 10, background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, cursor: selectedPlan ? 'pointer' : 'not-allowed' }}>Buat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
