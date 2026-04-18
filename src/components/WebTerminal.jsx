import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

const DRACULA = {
  background: '#0a0a0a',
  foreground: '#f8f8f2',
  cursor: '#f8f8f2',
  cursorAccent: '#0a0a0a',
  selectionBackground: '#44475a',
  black: '#21222c',
  red: '#ff5555',
  green: '#50fa7b',
  yellow: '#f1fa8c',
  blue: '#bd93f9',
  magenta: '#ff79c6',
  cyan: '#8be9fd',
  white: '#f8f8f2',
  brightBlack: '#6272a4',
  brightRed: '#ff6e6e',
  brightGreen: '#69ff94',
  brightYellow: '#ffffa5',
  brightBlue: '#d6acff',
  brightMagenta: '#ff92df',
  brightCyan: '#a4ffff',
  brightWhite: '#ffffff',
};

export default function WebTerminal({ server, onClose }) {
  const termRef = useRef(null);
  const terminalEl = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!terminalEl.current) return;

    const term = new Terminal({
      theme: DRACULA,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, 'Courier New', monospace",
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(terminalEl.current);
    fitAddon.fit();
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => { try { fitAddon.fit(); } catch {} };
    window.addEventListener('resize', handleResize);

    // Connect WebSocket
    const wsUrl = window.location.protocol === 'https:'
      ? `wss://${window.location.host}/terminal/${server.id || server.name}`
      : `ws://${window.location.host}:9001/terminal/${server.id || server.name}`;
    const token = localStorage.getItem('averacloud_token') || '';

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'output') {
          term.write(data.data);
        } else if (data.type === 'demo') {
          term.writeln('\r\n\x1b[33m⚠️ Terminal tersedia setelah server aktif (Tencent Cloud terhubung).\x1b[0m');
          term.writeln('\r\n\x1b[2mSementara, kelola server via Tencent Cloud Console.\x1b[0m');
          term.writeln('\r\n\x1b[2mhttps://console.cloud.tencent.com/cvm/instance\x1b[0m\r\n');
        } else if (data.type === 'error') {
          term.writeln(`\r\n\x1b[31m❌ ${data.message}\x1b[0m\r\n`);
        }
      } catch {
        term.write(e.data);
      }
    };

    ws.onerror = () => {
      term.writeln('\r\n\x1b[31m❌ Koneksi WebSocket gagal.\x1b[0m\r\n');
    };

    ws.onclose = () => {
      term.writeln('\r\n\x1b[33m⚠️ Koneksi terputus.\x1b[0m\r\n');
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data }));
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      term.dispose();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0a0a',
      zIndex: 200, display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        height: 40, background: '#111827', borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Terminal size={14} color="#22C55E" />
          <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{server.name || 'Terminal'}</span>
          <span style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace' }}>{server.ip || ''}</span>
        </div>
        <button onClick={onClose} style={{
          width: 28, height: 28, borderRadius: 6, background: 'rgba(239,68,68,.15)',
          border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={14} />
        </button>
      </div>

      {/* Terminal body */}
      <div ref={terminalEl} style={{
        flex: 1, padding: '4px 8px', overflow: 'hidden',
      }} />
    </div>
  );
}
