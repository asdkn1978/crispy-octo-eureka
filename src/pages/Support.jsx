import { useState } from 'react';
import { Send, X, Minus, Plus } from 'lucide-react';

const faqCategories = [
  {
    emoji: '🚀',
    title: 'Getting Started',
    items: [
      {
        q: 'Bagaimana cara membuat server?',
        a: 'Klik tab Servers → Buat Server → pilih plan → bayar via wallet'
      },
      {
        q: 'Apa itu AveraCloud?',
        a: 'AveraCloud adalah layanan VPS hosting yang dioptimasi untuk AI & automation. Kami menyediakan server dengan one-click install untuk berbagai aplikasi populer.'
      },
      {
        q: 'Bagaimana cara top up saldo?',
        a: 'Klik tab Wallet → Top Up → transfer ke rekening BCA yang tertera → kirim bukti ke bot Telegram @AveraCloudBot'
      }
    ]
  },
  {
    emoji: '💳',
    title: 'Pembayaran',
    items: [
      {
        q: 'Metode pembayaran apa yang tersedia?',
        a: 'Transfer bank (BCA), QRIS (via Midtrans, coming soon)'
      },
      {
        q: 'Berapa lama proses verifikasi top up?',
        a: 'Manual transfer: 1-30 menit (jam kerja). QRIS: otomatis 1-5 detik.'
      },
      {
        q: 'Apakah ada biaya admin?',
        a: 'Tidak ada biaya admin untuk transfer bank.'
      }
    ]
  },
  {
    emoji: '🖥️',
    title: 'Server',
    items: [
      {
        q: 'Apa bedanya plan Starter, Standard, Pro, Enterprise?',
        a: 'Perbedaan di RAM, storage, dan bandwidth. Starter cocok untuk web app, Standard untuk database, Pro untuk AI/ML, Enterprise untuk workload berat.'
      },
      {
        q: 'Bagaimana cara restart server?',
        a: 'Buka tab Servers → klik server → klik tombol Restart'
      },
      {
        q: 'Bisakah upgrade plan?',
        a: 'Ya, fitur upgrade plan akan tersedia segera.'
      },
      {
        q: 'Apakah ada backup otomatis?',
        a: 'Snapshot/backup akan tersedia di update berikutnya.'
      }
    ]
  },
  {
    emoji: '🔐',
    title: 'Security',
    items: [
      {
        q: 'Bagaimana keamanan server saya?',
        a: 'Semua server menggunakan firewall, SSH key authentication, dan isolasi antar user.'
      },
      {
        q: 'Bisakah reset password root?',
        a: 'Ya, via tab Settings di server detail.'
      }
    ]
  },
  {
    emoji: '🤖',
    title: 'AI & Apps',
    items: [
      {
        q: 'Apa itu one-click install apps?',
        a: 'Fitur untuk install aplikasi populer (Coolify, n8n, Open WebUI, dll) dengan satu klik tanpa konfigurasi manual.'
      },
      {
        q: 'App apa saja yang tersedia?',
        a: 'Coolify, Open WebUI, n8n, ComfyUI, Ollama, Jenkins, Grafana, Portainer, Meilisearch, dan terus bertambah.'
      },
      {
        q: 'Apakah bisa install custom app?',
        a: 'Ya, via SSH terminal di dashboard.'
      }
    ]
  },
  {
    emoji: '❓',
    title: 'Troubleshooting',
    items: [
      {
        q: 'Server tidak bisa diakses',
        a: 'Cek status server di dashboard. Jika "running" tapi tidak bisa akses, cek firewall rules dan SSH credentials. Restart server jika perlu.'
      },
      {
        q: 'Wallet saldo belum bertambah setelah transfer',
        a: 'Pastikan bukti transfer sudah dikirim ke @AveraCloudBot. Verifikasi dilakukan manual oleh admin. Tunggu 1-30 menit di jam kerja.'
      },
      {
        q: 'App install gagal',
        a: 'Pastikan server punya resource yang cukup (cek requirements app). Coba restart server lalu install ulang.'
      },
      {
        q: 'Website tidak bisa diakses',
        a: 'Pastikan domain sudah diarahkan ke server IP. Cek DNS propagation (bisa 1-24 jam). Cek port yang digunakan tidak diblokir firewall.'
      },
      {
        q: 'SSH terminal tidak bisa terhubung',
        a: 'Fitur terminal membutuhkan server yang sudah aktif (bukan demo mode). Hubungi admin jika masalah berlanjut.'
      }
    ]
  }
];

export default function Support() {
  const [openCategory, setOpenCategory] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleCategory = (idx) => {
    setOpenCategory(openCategory === idx ? null : idx);
    setOpenItem(null);
  };

  const toggleItem = (catIdx, itemIdx) => {
    if (openCategory !== catIdx) {
      setOpenCategory(catIdx);
      setOpenItem(itemIdx);
    } else {
      setOpenItem(openItem === itemIdx ? null : itemIdx);
    }
  };

  const handleSend = async () => {
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput.trim();
    const newMessages = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(newMessages);
    setChatInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: chatMessages })
      });
      const data = await res.json();
      setChatMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setChatMessages([...newMessages, { role: 'assistant', content: 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi @AveraCloudBot di Telegram.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page">
      <h1 className="support-title">Support & FAQ</h1>

      {/* FAQ Section */}
      <div className="faq-container">
        {faqCategories.map((cat, catIdx) => (
          <div key={catIdx} className="faq-category">
            <button
              className="faq-category-header"
              onClick={() => toggleCategory(catIdx)}
            >
              <span className="faq-emoji">{cat.emoji}</span>
              <span className="faq-cat-title">{cat.title}</span>
              {openCategory === catIdx ? <Minus size={18} /> : <Plus size={18} />}
            </button>
            {openCategory === catIdx && (
              <div className="faq-items">
                {cat.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="faq-item">
                    <button
                      className="faq-question"
                      onClick={() => toggleItem(catIdx, itemIdx)}
                    >
                      <span>{item.q}</span>
                      {openItem === itemIdx ? <Minus size={16} /> : <Plus size={16} />}
                    </button>
                    {openItem === itemIdx && (
                      <div className="faq-answer">{item.a}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Chat Widget */}
      {!chatOpen && (
        <button className="chat-widget-btn" onClick={() => setChatOpen(true)}>
          💬 Butuh bantuan?
        </button>
      )}

      {chatOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <span>🤖 AveraCloud AI Support</span>
            <button className="chat-close" onClick={() => setChatOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="chat-messages">
            {chatMessages.length === 0 && (
              <div className="chat-welcome">
                Halo! 👋 Saya AI Support AveraCloud.<br/>
                Ada yang bisa saya bantu tentang server, pembayaran, atau fitur lainnya?
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble ai">
                <span className="typing-indicator">...</span>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Ketik pertanyaan..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button
              className="chat-send"
              onClick={handleSend}
              disabled={loading || !chatInput.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .support-page {
          max-width: 800px;
          margin: 0 auto;
          padding-bottom: 100px;
        }
        .support-title {
          font-size: 28px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 24px;
        }
        .faq-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .faq-category {
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 12px;
          overflow: hidden;
        }
        .faq-category-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: none;
          border: none;
          color: #f1f5f9;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s;
        }
        .faq-category-header:hover {
          background: rgba(34, 197, 94, 0.05);
        }
        .faq-emoji {
          font-size: 20px;
        }
        .faq-cat-title {
          flex: 1;
        }
        .faq-items {
          border-top: 1px solid #1e293b;
        }
        .faq-item {
          border-bottom: 1px solid #1e293b;
        }
        .faq-item:last-child {
          border-bottom: none;
        }
        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px 14px 52px;
          background: none;
          border: none;
          color: #cbd5e1;
          font-size: 14px;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s, color 0.2s;
        }
        .faq-question:hover {
          background: rgba(34, 197, 94, 0.05);
          color: #f1f5f9;
        }
        .faq-answer {
          padding: 0 20px 16px 52px;
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.6;
        }

        /* Chat Widget */
        .chat-widget-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: linear-gradient(135deg, #22C55E, #16a34a);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 100;
        }
        .chat-widget-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(34, 197, 94, 0.5);
        }
        .chat-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 320px;
          height: 450px;
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          z-index: 100;
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid #1e293b;
          background: linear-gradient(135deg, #111827, #1e293b);
          border-radius: 16px 16px 0 0;
        }
        .chat-header span {
          color: #f1f5f9;
          font-weight: 600;
          font-size: 14px;
        }
        .chat-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chat-close:hover {
          color: #f1f5f9;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chat-welcome {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.6;
          text-align: center;
          padding: 20px 0;
        }
        .chat-bubble {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
          word-wrap: break-word;
        }
        .chat-bubble.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #22C55E, #16a34a);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.ai {
          align-self: flex-start;
          background: #1e293b;
          color: #cbd5e1;
          border-bottom-left-radius: 4px;
        }
        .typing-indicator {
          animation: typing 1.4s infinite;
        }
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
        .chat-input-area {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid #1e293b;
          background: #111827;
          border-radius: 0 0 16px 16px;
        }
        .chat-input {
          flex: 1;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 20px;
          padding: 10px 16px;
          color: #f1f5f9;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input:focus {
          border-color: #22C55E;
        }
        .chat-input::placeholder {
          color: #64748b;
        }
        .chat-send {
          background: linear-gradient(135deg, #22C55E, #16a34a);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }
        .chat-send:hover:not(:disabled) {
          transform: scale(1.05);
        }
        .chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .chat-widget {
            width: calc(100% - 32px);
            right: 16px;
            bottom: 16px;
            height: 400px;
          }
          .chat-widget-btn {
            right: 16px;
            bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
}
tiny change
