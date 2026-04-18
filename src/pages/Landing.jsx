import { useAuth } from '../AuthContext';
import { Cloud, Check, Zap, CreditCard, MessageCircle, Shield, Bot, RefreshCw, Globe, Headphones, Menu, X } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useState } from 'react';

const plans = [
  { name: 'Starter S', cpu: '2 Core', ram: '2 GB', storage: '40 GB SSD', bw: '1 Gbps', price: 'Rp50.000' },
  { name: 'Starter M', cpu: '2 Core', ram: '2 GB', storage: '50 GB SSD', bw: '1 Gbps', price: 'Rp65.000' },
  { name: 'Standard S', cpu: '2 Core', ram: '4 GB', storage: '60 GB SSD', bw: '1.5 Gbps', price: 'Rp80.000', popular: true },
  { name: 'Standard M', cpu: '2 Core', ram: '4 GB', storage: '70 GB SSD', bw: '1.5 Gbps', price: 'Rp90.000' },
  { name: 'Pro S', cpu: '2 Core', ram: '8 GB', storage: '80 GB SSD', bw: '2 Gbps', price: 'Rp130.000' },
  { name: 'Pro M', cpu: '2 Core', ram: '8 GB', storage: '100 GB SSD', bw: '2 Gbps', price: 'Rp160.000' },
  { name: 'Enterprise', cpu: '4 Core', ram: '8 GB', storage: '180 GB SSD', bw: '4 Gbps', price: 'Rp325.000' },
];

const features = [
  { icon: Zap, title: 'Server Tencent Cloud', desc: 'Infrastruktur kelas dunia dengan uptime 99.9%' },
  { icon: CreditCard, title: 'Bayar pakai QRIS', desc: 'GoPay, OVO, QRIS, Transfer — semua bisa' },
  { icon: Headphones, title: 'Support Bahasa Indonesia', desc: 'Tim support lokal via Telegram 24/7' },
  { icon: Shield, title: 'Keamanan Tinggi', desc: 'DDoS protection, firewall, backup otomatis' },
  { icon: Bot, title: 'AI-Powered Support', desc: 'Bot AI menjawab pertanyaan 24/7 via Telegram' },
  { icon: RefreshCw, title: 'Upgrade Tanpa Downtime', desc: 'Upgrade/downgrade server kapan saja' },
];

const faqs = [
  { q: 'Apa itu AveraCloud?', a: 'AveraCloud adalah penyedia cloud server (VPS) dari Indonesia, berbasis infrastruktur Tencent Cloud Singapore. Harga terjangkau dengan support lokal bahasa Indonesia.' },
  { q: 'Bagaimana cara order?', a: 'Klik "Pesan Sekarang" atau chat kami di Telegram @AveraCloudBot. Pilih paket, bayar via QRIS/GoPay/OVO, server langsung aktif dalam hitungan menit.' },
  { q: 'Metode pembayaran apa saja?', a: 'QRIS, GoPay, OVO, Dana, dan transfer bank (BCA, Mandiri, BNI). Semua diproses otomatis via Midtrans.' },
  { q: 'Server di mana lokasinya?', a: 'Semua server berlokasi di Singapore, latency rendah (~30ms) dari Indonesia.' },
  { q: 'Bisa refund?', a: 'Ya! Garansi uang kembali 7 hari. Hubungi support kami jika tidak puas.' },
];

export default function Landing() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,15,30,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '.8rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 18, color: '#f1f5f9' }}><Cloud size={24} color="#22C55E" />AveraCloud</div>
        {/* Desktop */}
        <div className="nav-links-desktop" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#harga" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none' }}>Harga</a>
          <a href="#fitur" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none' }}>Fitur</a>
          <a href="#faq" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none' }}>FAQ</a>
          <Link to="/dashboard" style={{ padding: '8px 20px', background: '#22C55E', color: '#000', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Dashboard</Link>
        </div>
        {/* Mobile hamburger */}
        <button className="nav-hamburger" onClick={() => setMobileMenu(!mobileMenu)} style={{ display: 'none', background: 'none', border: 'none', color: '#f1f5f9', cursor: 'pointer' }}>{mobileMenu ? <X size={24} /> : <Menu size={24} />}</button>
      </nav>
      {/* Mobile menu */}
      {mobileMenu && (
        <div style={{ position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99, background: 'rgba(10,15,30,.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '1rem 2rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <a href="#harga" onClick={() => setMobileMenu(false)} style={{ color: '#94a3b8', fontSize: 15, textDecoration: 'none' }}>Harga</a>
          <a href="#fitur" onClick={() => setMobileMenu(false)} style={{ color: '#94a3b8', fontSize: 15, textDecoration: 'none' }}>Fitur</a>
          <a href="#faq" onClick={() => setMobileMenu(false)} style={{ color: '#94a3b8', fontSize: 15, textDecoration: 'none' }}>FAQ</a>
          <Link to="/dashboard" onClick={() => setMobileMenu(false)} style={{ padding: '10px 20px', background: '#22C55E', color: '#000', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>Dashboard</Link>
        </div>
      )}

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '7rem 2rem 4rem', background: 'linear-gradient(135deg,#0a0f1e,#0c1929 40%,#0a0f1e)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 100, padding: '6px 16px', fontSize: 13, color: '#22C55E', marginBottom: 24 }}>🇮🇩 Server Singapore — Latency rendah dari Indonesia</div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, maxWidth: 720, margin: '0 auto 24px', color: '#f1f5f9' }}>Cloud Server Indonesia. <span style={{ color: '#22C55E' }}>Cepat, Stabil, Terjangkau.</span></h1>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem,2vw,1.15rem)', maxWidth: 540, margin: '0 auto 32px' }}>Server berbasis Tencent Cloud dengan harga terbaik. Support Indonesia 24/7 via Telegram.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#harga" style={{ padding: '12px 28px', background: '#22C55E', color: '#000', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>Lihat Harga</a>
            <a href="https://t.me/AveraCloudBot" target="_blank" style={{ padding: '12px 28px', border: '1.5px solid #1e293b', color: '#f1f5f9', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>💬 Hubungi Kami</a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 48, flexWrap: 'wrap' }}>
            {[['99.9%', 'Uptime'], ['< 30ms', 'Latency'], ['24/7', 'Support'], ['Rp50rb', 'Mulai dari']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 800, color: '#22C55E' }}>{n}</div><div style={{ fontSize: 13, color: '#94a3b8' }}>{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>Pilih Paket Server Kamu</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', margin: '8px auto 48px', maxWidth: 520 }}>Harga transparan, tanpa biaya tersembunyi.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
            {plans.map(p => (
              <div key={p.name} style={{ background: '#111827', border: p.popular ? '1px solid #22C55E' : '1px solid #1e293b', borderRadius: 14, padding: 24, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {p.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#22C55E', color: '#000', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 100 }}>POPULER</div>}
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#f1f5f9' }}>{p.name}</h3>
                {[['vCPU', p.cpu], ['RAM', p.ram], ['Storage', p.storage], ['Bandwidth', p.bw]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}><span>{k}</span><span style={{ color: '#f1f5f9', fontWeight: 500 }}>{v}</span></div>
                ))}
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 24, fontWeight: 800, color: '#22C55E', margin: '16px 0' }}>{p.price}<small style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8' }}>/bln</small></div>
                <Link to="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '10px', background: '#22C55E', color: '#000', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Pesan Sekarang</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>Fitur Unggulan</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', margin: '8px auto 48px', maxWidth: 520 }}>Semua yang kamu butuhkan untuk menjalankan server.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            {features.map(f => <div key={f.title} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 14, padding: 24 }}><f.icon size={32} color="#22C55E" style={{ marginBottom: 12 }} /><h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#f1f5f9' }}>{f.title}</h3><p style={{ color: '#94a3b8', fontSize: 14 }}>{f.desc}</p></div>)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>Pertanyaan Umum</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', margin: '8px auto 48px' }}>Yang sering ditanyakan.</p>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
              <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 14, color: '#f1f5f9' }}>{f.q}<span style={{ color: '#22C55E', fontSize: 18 }}>{openFaq === i ? '−' : '+'}</span></div>
              {openFaq === i && <div style={{ padding: '0 16px 14px', color: '#94a3b8', fontSize: 14, lineHeight: 1.7 }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem', background: 'linear-gradient(135deg,#0c1929,#0a0f1e)' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Siap Mulai?</h2>
        <p style={{ color: '#94a3b8', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>Dapatkan server cloud dalam hitungan menit.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://t.me/AveraCloudBot" target="_blank" style={{ padding: '12px 28px', background: '#22C55E', color: '#000', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>💬 Chat di Telegram</a>
          <Link to="/dashboard" style={{ padding: '12px 28px', border: '1.5px solid #1e293b', color: '#f1f5f9', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Dashboard</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '3rem 2rem', borderTop: '1px solid #1e293b', color: '#94a3b8', fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 8 }}>
          <a href="https://t.me/AveraCloudBot" target="_blank" style={{ color: '#94a3b8', textDecoration: 'none' }}>Telegram</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Kebijakan Privasi</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Syarat & Ketentuan</a>
        </div>
        <p>© 2026 AveraCloud. All rights reserved.</p>
      </footer>
    </div>
  );
}
