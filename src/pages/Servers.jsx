import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { Plus, RotateCw, Trash2, Server, Cpu, HardDrive, Hammer, Eye, EyeOff } from 'lucide-react';

const planOptions = [
  { id: 'starter_s', name: 'Starter S', price: 50000, cpu: '2 Core', ram: '2 GB', storage: '40 GB SSD', bw: '1 Gbps' },
  { id: 'starter_m', name: 'Starter M', price: 65000, cpu: '2 Core', ram: '2 GB', storage: '50 GB SSD', bw: '1 Gbps' },
  { id: 'standard_s', name: 'Standard S', price: 80000, cpu: '2 Core', ram: '4 GB', storage: '60 GB SSD', bw: '1.5 Gbps' },
  { id: 'standard_m', name: 'Standard M', price: 90000, cpu: '2 Core', ram: '4 GB', storage: '70 GB SSD', bw: '1.5 Gbps' },
  { id: 'pro_s', name: 'Pro S', price: 130000, cpu: '2 Core', ram: '8 GB', storage: '80 GB SSD', bw: '2 Gbps' },
  { id: 'pro_m', name: 'Pro M', price: 160000, cpu: '2 Core', ram: '8 GB', storage: '100 GB SSD', bw: '2 Gbps' },
  { id: 'enterprise', name: 'Enterprise', price: 325000, cpu: '4 Core', ram: '8 GB', storage: '180 GB SSD', bw: '4 Gbps' },
];

function getPlanMeta(planId) {
  return planOptions.find(p => p.id === planId) || planOptions[0];
}

const statusColors = {
  running: { bg: 'rgba(34,197,94,.15)', color: '#22C55E' },
  creating: { bg: 'rgba(251,191,36,.15)', color: '#fbbf24' },
  stopped: { bg: 'rgba(239,68,68,.15)', color: '#ef4444' },
  error: { bg: 'rgba(239,68,68,.15)', color: '#ef4444' },
};

export default function Servers() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [expandedServer, setExpandedServer] = useState(null);
  const [creating, setCreating] = useState(false);

  async function loadServers() {
    const res = await api('/api/vps');
    const list = (res.data || res.instances || []).map(s => ({
      ...s,
      createdAt: s.createdAt || Date.now(),
    }));
    setServers(list);
    setLoading(false);
  }

  const simulateStatus = useCallback(() => {
    setServers(prev => prev.map(s => {
      if (s.status === 'creating' && Date.now() - s.createdAt > 30000) {
        return { ...s, status: 'running', ip: s.ip || `103.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}` };
      }
      return s;
    }));
  }, []);

  useEffect(() => { loadServers(); }, []);
  useEffect(() => {
    const iv = setInterval(simulateStatus, 5000);
    return () => clearInterval(iv);
  }, [simulateStatus]);

  async function handleCreate() {
    if (!selectedPlan) return;
    setCreating(true);
    const p = planOptions.find(x => x.id === selectedPlan);
    const newServer = {
      name: p.name + '-' + Date.now().toString(36),
      plan: selectedPlan,
      status: 'creating',
      ip: null,
      createdAt: Date.now(),
    };
    try {
      const res = await api('/api/vps', { method: 'POST', body: JSON.stringify({ plan_id: selectedPlan, name: newServer.name }) });
      if (res.success) {
        setServers(prev => [...prev, { ...newServer, ip: res.data?.ip, status: res.data?.status || 'creating' }]);
      } else {
        setServers(prev => [...prev, newServer]);
      }
    } catch {
      setServers(prev => [...prev, newServer]);
    }
    setShowCreate(false);
    setSelectedPlan('');
    setCreating(false);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {servers.map((s, i) => {
            const meta = getPlanMeta(s.plan);
            const sc = statusColors[s.status] || statusColors.creating;
            const isExpanded = expandedServer === i;
            return (
              <div key={i} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', cursor: 'pointer' }} onClick={() => setExpandedServer(isExpanded ? null : i)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Cpu size={20} color="#22C55E" />
                    <div>
                      <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{s.name || 'Server ' + (i + 1)}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{meta.name} · {meta.cpu} · {meta.ram}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>{s.status || 'unknown'}</span>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{s.ip || 'Mengalokasi...'}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #1e293b', padding: '14px 18px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 16 }}>
                      {[
                        ['vCPU', meta.cpu],
                        ['RAM', meta.ram],
                        ['Storage', meta.storage],
                        ['Bandwidth', meta.bw],
                        ['Harga', `Rp${meta.price.toLocaleString('id-ID')}/bln`],
                      ].map(([k, v]) => (
                        <div key={k} style={{ background: '#0a0f1e', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ color: '#64748b', fontSize: 11, marginBottom: 2 }}>{k}</div>
                          <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button title="Restart" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(59,130,246,.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,.2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}><RotateCw size={14} />Restart</button>
                      <button title="Rebuild" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(251,191,36,.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}><Hammer size={14} />Rebuild</button>
                      <button title="Delete" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(239,68,68,.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}><Trash2 size={14} />Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }}>
            <h3 style={{ color: '#f1f5f9', fontSize: 18, marginBottom: 20 }}>Buat Server Baru</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, maxHeight: 300, overflowY: 'auto' }}>
              {planOptions.map(p => (
                <label key={p.id} onClick={() => setSelectedPlan(p.id)} style={{ display: 'flex', flexDirection: 'column', padding: 12, background: selectedPlan === p.id ? 'rgba(34,197,94,.1)' : 'transparent', border: selectedPlan === p.id ? '1px solid #22C55E' : '1px solid #1e293b', borderRadius: 10, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: 14 }}>{p.name}</span>
                    <span style={{ color: '#22C55E', fontWeight: 600, fontSize: 14 }}>Rp{p.price.toLocaleString('id-ID')}/bln</span>
                  </div>
                  <span style={{ color: '#64748b', fontSize: 11 }}>{p.cpu} · {p.ram} · {p.storage} · {p.bw}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: 10, background: 'transparent', border: '1px solid #1e293b', color: '#f1f5f9', borderRadius: 8, cursor: 'pointer' }}>Batal</button>
              <button onClick={handleCreate} disabled={!selectedPlan || creating} style={{ flex: 1, padding: 10, background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, cursor: selectedPlan && !creating ? 'pointer' : 'not-allowed', opacity: selectedPlan && !creating ? 1 : .5 }}>{creating ? 'Membuat...' : 'Buat'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
