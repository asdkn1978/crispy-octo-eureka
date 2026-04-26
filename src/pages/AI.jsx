import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Bot, Key, BarChart3, Copy, Check, Trash2, Plus, Zap } from 'lucide-react';

export default function AI() {
  const { token } = useAuth();
  const [models, setModels] = useState([]);
  const [keys, setKeys] = useState([]);
  const [usage, setUsage] = useState([]);
  const [tab, setTab] = useState('models');
  const [copied, setCopied] = useState('');
  const [endpoint] = useState('https://api.averacloud.com/v1/chat/completions');

  const fetchModels = async () => {
    try {
      const r = await fetch('/api/ai/models', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.success) setModels(d.data);
    } catch {}
  };

  const fetchKeys = async () => {
    try {
      const r = await fetch('/api/ai/keys', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.success) setKeys(d.data || []);
    } catch {}
  };

  const fetchUsage = async () => {
    try {
      const r = await fetch('/api/ai/usage', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.success) setUsage(d.data || []);
    } catch {}
  };

  const createKey = async () => {
    const name = prompt('Nama API Key:');
    if (!name) return;
    try {
      const r = await fetch('/api/ai/keys', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const d = await r.json();
      if (d.success) {
        alert('API Key berhasil dibuat!\n\nSALIN KUNCI INI (tidak ditampilkan lagi):\n' + d.data.key);
        fetchKeys();
      } else {
        alert(d.error || 'Gagal membuat key');
      }
    } catch {}
  };

  const revokeKey = async (id) => {
    if (!confirm('Hapus API key ini?')) return;
    try {
      await fetch(`/api/ai/keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKeys();
    } catch {}
  };

  useEffect(() => { fetchModels(); fetchKeys(); fetchUsage(); }, []);

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>🤖 AI API Service</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Akses 100+ model AI via OpenAI-compatible API</p>
        </div>
      </div>

      {/* Endpoint Info */}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Zap size={16} color="#22C55E" />
          <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>API Endpoint</span>
          <button onClick={() => copyText(endpoint, 'endpoint')} style={{ marginLeft: 'auto', background: '#334155', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
            {copied === 'endpoint' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
        <code style={{ color: '#22C55E', fontSize: 13, wordBreak: 'break-all' }}>{endpoint}</code>
        <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>OpenAI-compatible. Gunakan API key dari tab "API Keys" sebagai Bearer token.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#1e293b', borderRadius: 10, padding: 4, border: '1px solid #334155' }}>
        {[
          { id: 'models', label: '📦 Models', icon: Bot },
          { id: 'keys', label: '🔑 API Keys', icon: Key },
          { id: 'usage', label: '📊 Usage', icon: BarChart3 },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all .2s', background: tab === t.id ? '#22C55E' : 'transparent', color: tab === t.id ? '#fff' : '#94a3b8' }}>
            <t.icon size={16} />{t.label}
          </button>
        ))}
      </div>

      {/* Models Tab */}
      {tab === 'models' && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
            {models.map(m => (
              <div key={m.id} style={{ background: '#111827', borderRadius: 10, padding: 16, border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                    <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{m.provider}</div>
                  </div>
                  <span style={{ background: 'rgba(34,197,94,.15)', color: '#22C55E', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>Active</span>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid #1e293b' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>Input (1M tokens)</div>
                    <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>${m.pricing.input.sell_per_1m_usd}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>Output (1M tokens)</div>
                    <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>${m.pricing.output.sell_per_1m_usd}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ color: '#64748b', fontSize: 11 }}>Model ID</div>
                    <code style={{ color: '#94a3b8', fontSize: 11 }}>{m.id}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {tab === 'keys' && (
        <div>
          <button onClick={createKey} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#22C55E', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
            <Plus size={16} /> Buat API Key Baru
          </button>
          {keys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
              <Key size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>Belum ada API key</p>
              <p style={{ fontSize: 13 }}>Buat API key untuk mengakses AI API dari aplikasi kamu</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {keys.map(k => (
                <div key={k.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111827', borderRadius: 8, padding: 14, border: '1px solid #1e293b' }}>
                  <div>
                    <div style={{ color: '#f1f5f9', fontSize: 14 }}>{k.name}</div>
                    <code style={{ color: '#64748b', fontSize: 12 }}>{k.key_prefix}...</code>
                    {k.last_used_at && <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>Terakhir: {new Date(k.last_used_at).toLocaleString('id-ID')}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: k.is_active ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)', color: k.is_active ? '#22C55E' : '#ef4444', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>{k.is_active ? 'Active' : 'Revoked'}</span>
                    <button onClick={() => revokeKey(k.id)} style={{ background: 'rgba(239,68,68,.1)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Usage Tab */}
      {tab === 'usage' && (
        <div>
          {usage.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
              <BarChart3 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>Belum ada penggunaan</p>
              <p style={{ fontSize: 13 }}>Gunakan API untuk melihat usage di sini</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    {['Waktu', 'Model', 'Input Tokens', 'Output Tokens', 'Cost', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: 12, color: '#64748b', fontSize: 12, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usage.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: 12, color: '#94a3b8', fontSize: 13 }}>{new Date(u.created_at).toLocaleString('id-ID')}</td>
                      <td style={{ padding: 12, color: '#f1f5f9', fontSize: 13 }}>{u.model}</td>
                      <td style={{ padding: 12, color: '#94a3b8', fontSize: 13 }}>{u.input_tokens?.toLocaleString()}</td>
                      <td style={{ padding: 12, color: '#94a3b8', fontSize: 13 }}>{u.output_tokens?.toLocaleString()}</td>
                      <td style={{ padding: 12, color: '#22C55E', fontSize: 13, fontWeight: 600 }}>${(u.cost_usd || 0).toFixed(4)}</td>
                      <td style={{ padding: 12 }}><span style={{ background: u.status === 'success' ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)', color: u.status === 'success' ? '#22C55E' : '#ef4444', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
