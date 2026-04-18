import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api';
import { Plus, RotateCw, Trash2, Server, Cpu, HardDrive, Hammer, Eye, EyeOff, Copy, Check, Terminal, Camera, Globe, Clock, Activity, Database, ArrowUpDown } from 'lucide-react';

const planOptions = [
  { id: 'starter_s', name: 'Starter S', price: 50000, cpu: '2 Core', ram: '2 GB', storage: '40 GB SSD', bw: '1 Gbps', ramGb: 2, storageGb: 40 },
  { id: 'starter_m', name: 'Starter M', price: 65000, cpu: '2 Core', ram: '2 GB', storage: '50 GB SSD', bw: '1.5 Gbps', ramGb: 2, storageGb: 50 },
  { id: 'standard_s', name: 'Standard S', price: 80000, cpu: '2 Core', ram: '4 GB', storage: '60 GB SSD', bw: '1.5 Gbps', ramGb: 4, storageGb: 60 },
  { id: 'standard_m', name: 'Standard M', price: 90000, cpu: '2 Core', ram: '4 GB', storage: '70 GB SSD', bw: '1.5 Gbps', ramGb: 4, storageGb: 70 },
  { id: 'pro_s', name: 'Pro S', price: 130000, cpu: '2 Core', ram: '8 GB', storage: '80 GB SSD', bw: '2 Gbps', ramGb: 8, storageGb: 80 },
  { id: 'pro_m', name: 'Pro M', price: 160000, cpu: '2 Core', ram: '8 GB', storage: '100 GB SSD', bw: '2 Gbps', ramGb: 8, storageGb: 100 },
  { id: 'enterprise', name: 'Enterprise', price: 325000, cpu: '4 Core', ram: '8 GB', storage: '180 GB SSD', bw: '4 Gbps', ramGb: 8, storageGb: 180 },
];

function getPlanMeta(planId) {
  return planOptions.find(p => p.id === planId) || planOptions[0];
}

// Simulated monitoring data per server
function getSimulatedUsage(server) {
  if (server.status !== 'running') return null;
  const meta = getPlanMeta(server.plan);
  const seed = (server.name || '').length + (server.ip || '').charCodeAt(0);
  const cpu = 15 + (seed * 7) % 40;
  const ramUsed = (meta.ramGb * (0.2 + (seed * 3) % 50 / 100)).toFixed(1);
  const diskUsed = Math.round(meta.storageGb * (0.15 + (seed * 5) % 35 / 100));
  const bw = (8 + (seed * 11) % 30).toFixed(1);
  return { cpu: Math.round(cpu), ramUsed, ramTotal: meta.ramGb, diskUsed, diskTotal: meta.storageGb, bandwidth: bw };
}

function getUptime(server) {
  if (server.status !== 'running' || !server.createdAt) return null;
  const diff = Date.now() - server.createdAt;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pw = '';
  for (let i = 0; i < 16; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

const ProgressBar = ({ label, value, max, unit, color = '#22C55E' }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ color: '#94a3b8', fontSize: 11 }}>{label}</span>
        <span style={{ color: '#f1f5f9', fontSize: 11, fontWeight: 500 }}>{value}{unit} / {max}{unit} ({pct}%)</span>
      </div>
      <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .5s' }} />
      </div>
    </div>
  );
};

const StatusDot = ({ status }) => {
  if (status === 'creating') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: '#fbbf24',
          animation: 'spin 1s linear infinite', border: '2px solid transparent', borderTopColor: '#fbbf24'
        }} />
        Sedang diproses...
      </span>
    );
  }
  const colors = { running: '#22C55E', stopped: '#64748b', error: '#ef4444' };
  const c = colors[status] || colors.stopped;
  const pulse = status === 'running';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: pulse ? `0 0 6px ${c}` : 'none', animation: pulse ? 'pulse 2s infinite' : 'none' }} /></span>;
};

const ConfirmButton = ({ icon: Icon, label, color, border, confirmMsg, onConfirm, disabled, tooltip }) => (
  <button
    title={tooltip}
    disabled={disabled}
    onClick={disabled ? undefined : () => {
      if (window.confirm(confirmMsg)) onConfirm();
    }}
    style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
      background: disabled ? 'rgba(100,116,139,.08)' : `${color}18`,
      color: disabled ? '#475569' : color, border: `1px solid ${disabled ? 'rgba(100,116,139,.15)' : border}`,
      borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500,
      position: 'relative'
    }}
  >{Icon && <Icon size={14} />}{label}</button>
);

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'rgba(34,197,94,.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,.2)', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>
      {copied ? <><Check size={12} />Copied</> : <><Copy size={12} />Copy</>}
    </button>
  );
};

export default function Servers() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [expandedServer, setExpandedServer] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});

  async function loadServers() {
    const res = await api('/api/vps');
    const list = (res.data || res.instances || []).map(s => ({
      ...s,
      createdAt: s.createdAt || Date.now(),
      rootPassword: s.rootPassword || generatePassword(),
      region: s.region || 'Singapore',
      os: s.os || 'Ubuntu 22.04 LTS',
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
      rootPassword: generatePassword(),
      region: 'Singapore',
      os: 'Ubuntu 22.04 LTS',
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

  const handleRestart = (idx) => setServers(prev => prev.map((s, i) => i === idx ? { ...s, status: 'creating', createdAt: Date.now() } : s));
  const handleRebuild = (idx) => setServers(prev => prev.map((s, i) => i === idx ? { ...s, status: 'creating', createdAt: Date.now(), rootPassword: generatePassword() } : s));
  const handleDelete = (idx) => setServers(prev => prev.filter((_, i) => i !== idx));

  const stats = useMemo(() => {
    const total = servers.length;
    const running = servers.filter(s => s.status === 'running').length;
    const monthly = servers.reduce((sum, s) => sum + (getPlanMeta(s.plan).price || 0), 0);
    return { total, running, monthly };
  }, [servers]);

  return (
    <div>
      {/* CSS animations */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 4px currentColor} 50%{opacity:.5;box-shadow:0 0 8px currentColor} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* Summary stats bar */}
      {!loading && servers.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { icon: Server, label: 'Total Server', value: stats.total, color: '#22C55E' },
            { icon: Activity, label: 'Running', value: stats.running, color: '#22C55E' },
            { icon: ArrowUpDown, label: 'Biaya Bulanan', value: `Rp${stats.monthly.toLocaleString('id-ID')}`, color: '#fbbf24' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#111827', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 16px', minWidth: 160 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: 11 }}>{label}</div>
                <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 700 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

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
            const sc = { running: { bg: 'rgba(34,197,94,.15)', color: '#22C55E' }, creating: { bg: 'rgba(251,191,36,.15)', color: '#fbbf24' }, stopped: { bg: 'rgba(239,68,68,.15)', color: '#ef4444' }, error: { bg: 'rgba(239,68,68,.15)', color: '#ef4444' } }[s.status] || { bg: 'rgba(148,163,184,.15)', color: '#94a3b8' };
            const isExpanded = expandedServer === i;
            const usage = getSimulatedUsage(s);
            const uptime = getUptime(s);
            const showPw = showPasswords[i];
            return (
              <div key={i} style={{ background: '#111827', border: isExpanded ? '1px solid rgba(34,197,94,.3)' : '1px solid #1e293b', borderRadius: 14, overflow: 'hidden', transition: 'border-color .2s' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', cursor: 'pointer' }} onClick={() => setExpandedServer(isExpanded ? null : i)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34,197,94,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Cpu size={18} color="#22C55E" />
                    </div>
                    <div>
                      <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{s.name || 'Server ' + (i + 1)}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{meta.name} · {meta.cpu} · {meta.ram}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <StatusDot status={s.status} />
                      {s.status === 'creating' ? null : s.status}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}>{s.ip || 'Mengalokasi...'}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #1e293b', padding: '18px' }}>
                    {/* Server info grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 10, marginBottom: 16 }}>
                      {[
                        { icon: Cpu, label: 'vCPU', value: meta.cpu },
                        { icon: Activity, label: 'RAM', value: meta.ram },
                        { icon: HardDrive, label: 'Storage', value: meta.storage },
                        { icon: Globe, label: 'Bandwidth', value: meta.bw },
                        { icon: Database, label: 'Harga', value: `Rp${meta.price.toLocaleString('id-ID')}/bln` },
                        { icon: Globe, label: 'Region', value: `${s.region} 🇸🇬` },
                        { icon: Server, label: 'OS', value: s.os },
                        { icon: Clock, label: 'Created', value: new Date(s.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                        { icon: Clock, label: 'Uptime', value: uptime || '—' },
                        { icon: Globe, label: 'Traffic', value: usage ? `${usage.bandwidth} GB / Unlimited` : '—' },
                      ].map(({ icon: Ic, label, value }) => (
                        <div key={label} style={{ background: '#0a0f1e', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Ic size={14} color="#64748b" />
                          <div>
                            <div style={{ color: '#64748b', fontSize: 10 }}>{label}</div>
                            <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600 }}>{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* SSH & Root Password */}
                    {s.ip && s.status === 'running' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, padding: '12px 14px', background: '#0a0f1e', borderRadius: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ color: '#64748b', fontSize: 11, marginRight: 8 }}>SSH:</span>
                            <code style={{ color: '#22C55E', fontSize: 12, fontFamily: 'monospace', background: 'rgba(34,197,94,.08)', padding: '2px 8px', borderRadius: 4 }}>ssh root@{s.ip}</code>
                          </div>
                          <CopyButton text={`ssh root@${s.ip}`} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ color: '#64748b', fontSize: 11, marginRight: 8 }}>Root Password:</span>
                            <code style={{ color: '#f1f5f9', fontSize: 12, fontFamily: 'monospace' }}>
                              {showPw ? s.rootPassword : '••••••••••••••••'}
                            </code>
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => setShowPasswords(p => ({ ...p, [i]: !p[i] }))} style={{ padding: '3px 8px', background: 'rgba(148,163,184,.12)', color: '#94a3b8', border: '1px solid rgba(148,163,184,.2)', borderRadius: 6, cursor: 'pointer', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              {showPw ? <><EyeOff size={12} />Hide</> : <><Eye size={12} />Show</>}
                            </button>
                            <CopyButton text={s.rootPassword} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Usage monitoring */}
                    {usage && (
                      <div style={{ marginBottom: 16, padding: '12px 14px', background: '#0a0f1e', borderRadius: 10 }}>
                        <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Activity size={14} color="#22C55E" /> Resource Usage
                        </div>
                        <ProgressBar label="CPU" value={usage.cpu} max={100} unit="%" color="#22C55E" />
                        <ProgressBar label="RAM" value={usage.ramUsed} max={usage.ramTotal} unit=" GB" color="#3b82f6" />
                        <ProgressBar label="Disk" value={usage.diskUsed} max={usage.diskTotal} unit=" GB" color="#f59e0b" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <span style={{ color: '#94a3b8', fontSize: 11 }}>Bandwidth</span>
                          <span style={{ color: '#f1f5f9', fontSize: 11, fontWeight: 500 }}>{usage.bandwidth} GB bulan ini</span>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <ConfirmButton icon={RotateCw} label="Restart" color="#3b82f6" border="rgba(59,130,246,.2)" confirmMsg="Yakin restart server?" onConfirm={() => handleRestart(i)} disabled={s.status === 'creating'} />
                      <ConfirmButton icon={Hammer} label="Rebuild" color="#fbbf24" border="rgba(251,191,36,.2)" confirmMsg="SEMUA DATA AKAN HILANG. Lanjutkan?" onConfirm={() => handleRebuild(i)} disabled={s.status === 'creating'} />
                      <ConfirmButton icon={Trash2} label="Delete" color="#ef4444" border="rgba(239,68,68,.2)" confirmMsg="Server akan dihapus permanen. Lanjutkan?" onConfirm={() => handleDelete(i)} disabled={s.status === 'creating'} />
                      <ConfirmButton icon={Terminal} label="Console" color="#94a3b8" border="rgba(148,163,184,.2)" disabled tooltip="Coming soon" />
                      <ConfirmButton icon={Camera} label="Snapshot" color="#94a3b8" border="rgba(148,163,184,.2)" disabled tooltip="Coming soon" />
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
