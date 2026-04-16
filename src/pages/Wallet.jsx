import { useEffect, useState } from 'react';
import api from '../api';
import { Wallet as WalletIcon, Plus, ArrowUpCircle } from 'lucide-react';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopup, setShowTopup] = useState(false);

  async function load() {
    const [w, t] = await Promise.all([api('/api/wallet'), api('/api/wallet/transactions')]);
    setWallet(w.data || null);
    setTxns(t.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleTopup() {
    const amount = parseInt(topupAmount);
    if (!amount || amount < 10000) return;
    const res = await api('/api/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) });
    if (res.data?.payment_url) { window.open(res.data.payment_url, '_blank'); }
    setShowTopup(false);
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>Wallet</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><WalletIcon size={20} color="#22C55E" /><span style={{ color: '#94a3b8', fontSize: 13 }}>Saldo</span></div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>{loading ? '...' : `Rp${Number(wallet?.balance || 0).toLocaleString('id-ID')}`}</div>
        </div>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setShowTopup(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#22C55E', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}><Plus size={16} />Top Up Saldo</button>
        </div>
      </div>

      <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}><h3 style={{ color: '#f1f5f9', fontSize: 16 }}>Riwayat Transaksi</h3></div>
        {txns.length === 0 ? (
          <p style={{ padding: 24, color: '#94a3b8', textAlign: 'center' }}>Belum ada transaksi</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #1e293b' }}>
              {[['Deskripsi', 'text-left'], ['Jumlah', 'text-right'], ['Status', 'text-center'], ['Tanggal', 'text-right']].map(([h, a]) => (
                <th key={h} style={{ padding: '10px 16px', textAlign: a, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{txns.map((t, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '10px 16px', color: '#f1f5f9', fontSize: 13 }}>{t.description}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: t.type === 'credit' ? '#22C55E' : '#ef4444', fontSize: 13 }}>{t.type === 'credit' ? '+' : '-'}Rp{Number(t.amount).toLocaleString('id-ID')}</td>
                <td style={{ padding: '10px 16px', textAlign: 'center' }}><span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, background: t.status === 'completed' ? 'rgba(34,197,94,.15)' : 'rgba(245,158,11,.15)', color: t.status === 'completed' ? '#22C55E' : '#f59e0b' }}>{t.status}</span></td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#94a3b8', fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {showTopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380 }}>
            <h3 style={{ color: '#f1f5f9', fontSize: 18, marginBottom: 16 }}>Top Up Saldo</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Minimal Rp10.000. Pembayaran via QRIS/GoPay/OVO.</p>
            <input type="number" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} placeholder="100000" style={{ width: '100%', padding: 12, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, color: '#f1f5f9', fontSize: 16, marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[50000, 100000, 200000, 500000].map(a => (
                <button key={a} onClick={() => setTopupAmount(a)} style={{ flex: 1, padding: 8, background: topupAmount == a ? 'rgba(34,197,94,.15)' : 'transparent', border: topupAmount == a ? '1px solid #22C55E' : '1px solid #1e293b', color: '#f1f5f9', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Rp{a/1000}rb</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowTopup(false)} style={{ flex: 1, padding: 10, background: 'transparent', border: '1px solid #1e293b', color: '#f1f5f9', borderRadius: 8, cursor: 'pointer' }}>Batal</button>
              <button onClick={handleTopup} style={{ flex: 1, padding: 10, background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>Bayar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
