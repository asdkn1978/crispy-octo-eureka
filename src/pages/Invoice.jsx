import { useState, useEffect } from 'react';
import { FileText, Filter } from 'lucide-react';

export default function Invoice() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/billing/invoices')
      .then(r => r.json())
      .then(d => { setInvoices(d.invoices || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);
  const totalThisMonth = invoices.filter(i => {
    const d = new Date(i.created_at || i.tanggal);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, i) => s + (i.amount || i.jumlah || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || i.jumlah || 0), 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.amount || i.jumlah || 0), 0);

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const statusColor = { paid: '#22C55E', pending: '#f59e0b', failed: '#ef4444' };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Memuat...</div>;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <h2 style={{ color: '#f1f5f9', fontSize: 20, marginBottom: 20 }}>Invoice & Billing</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Bulan Ini', value: fmt(totalThisMonth), color: '#f1f5f9' },
          { label: 'Total Paid', value: fmt(totalPaid), color: '#22C55E' },
          { label: 'Total Pending', value: fmt(totalPending), color: '#f59e0b' },
        ].map(c => (
          <div key={c.label} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Filter size={16} color="#94a3b8" />
        {['all', 'pending', 'paid', 'failed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: filter === s ? 'rgba(34,197,94,.15)' : '#111827', color: filter === s ? '#22C55E' : '#94a3b8',
            borderColor: filter === s ? '#22C55E' : '#1e293b'
          }}>{s === 'all' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 48, textAlign: 'center' }}>
          <FileText size={40} color="#1e293b" style={{ marginBottom: 12 }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Belum ada invoice</p>
          <p style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>Invoice akan muncul setelah transaksi pertama kamu</p>
        </div>
      ) : (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                {['ID', 'Deskripsi', 'Jumlah', 'Status', 'Tanggal'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <tr key={inv.id || i} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px 16px', color: '#f1f5f9' }}>#{inv.id || '-'}</td>
                  <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>{inv.description || inv.deskripsi || '-'}</td>
                  <td style={{ padding: '12px 16px', color: '#f1f5f9', fontWeight: 600 }}>{fmt(inv.amount || inv.jumlah || 0)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: (statusColor[inv.status] || '#94a3b8') + '22', color: statusColor[inv.status] || '#94a3b8' }}>
                      {(inv.status || '-').charAt(0).toUpperCase() + (inv.status || '-').slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{inv.created_at || inv.tanggal ? new Date(inv.created_at || inv.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
