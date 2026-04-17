import { useEffect, useState } from 'react';
import api from '../api';
import { Wallet as WalletIcon, Plus, ArrowUpCircle } from 'lucide-react';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopup, setShowTopup] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  async function load() {
    const [w, t] = await Promise.all([api('/api/wallet'), api('/api/wallet/transactions')]);
    setWallet(w.data || w);
    setTxns(t.data || t.transactions || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleTopup() {
    const amount = parseInt(topupAmount);
    if (!amount || amount < 50000) return;
    const res = await api('/api/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) });
    if (res.snap_token || res.redirect_url) {
      window.open(res.redirect_url || res.snap_token, '_blank');
      setShowTopup(false);
    } else if (res.manual) {
      setPaymentInfo({ ...res, amount });
      setShowTopup(false);
    } else {
      setShowTopup(false);
      load();
    }
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
      {/* Payment Confirmation Modal */}
      {paymentInfo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 16, padding: 28, width: '100%', maxWidth: 400 }}>
            <h3 style={{ color: '#f1f5f9', fontSize: 18, marginBottom: 4 }}>💰 Konfirmasi Pembayaran</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>Transfer ke rekening berikut, lalu kirim bukti ke Telegram bot @AveraCloudBot</p>
            
            <div style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Bank</div>
                <div style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 600 }}>{paymentInfo.bank?.name} — {paymentInfo.bank?.holder}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Nomor Rekening</div>
                <div style={{ color: '#22C55E', fontSize: 20, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1 }}>{paymentInfo.bank?.account}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Jumlah Transfer</div>
                <div style={{ color: '#f59e0b', fontSize: 20, fontWeight: 700 }}>Rp{Number(paymentInfo.amount).toLocaleString('id-ID')}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>📌 Setelah transfer, kirim bukti screenshot ke <strong style={{ color: '#22C55E' }}>@AveraCloudBot</strong> di Telegram dengan perintah <code style={{ background: '#0a0f1e', padding: '2px 6px', borderRadius: 4, color: '#f1f5f9', fontSize: 11 }}>/topup</code></p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Reference ID</div>
              <code style={{ color: '#64748b', fontSize: 12 }}>{paymentInfo.reference_id}</code>
            </div>

            <button onClick={() => { setPaymentInfo(null); setTopupAmount(''); load(); window.open('https://t.me/AveraCloudBot?start=topup', '_blank'); }} style={{ width: '100%', padding: 12, background: '#22C55E', color: '#000', fontWeight: 600, border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>Sudah Dibayar → Kirim Bukti</button>
          </div>
        </div>
      )}
    </div>
  );
}
