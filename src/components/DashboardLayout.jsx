import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LayoutDashboard, Server, Wallet, Settings, LogOut, Menu, Cloud, FileText, Package, HelpCircle, Bot, ChevronLeft, ChevronRight } from 'lucide-react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/servers', icon: Server, label: 'Server' },
  { to: '/apps', icon: Package, label: 'Apps' },
  { to: '/ai', icon: Bot, label: 'AI API' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/invoices', icon: FileText, label: 'Invoice' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
  { to: '/settings', icon: Settings, label: 'Pengaturan' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const expanded = collapsed ? hovered : true;

  return (
    <div className="dash-layout">
      <aside
        className={"dash-sidebar" + (collapsed ? " collapsed" : "") + (hovered && collapsed ? " hovered" : "") + (mobileOpen ? " open" : "")}
        onMouseEnter={() => { if (collapsed) setHovered(true); }}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="dash-logo">{expanded && <Cloud size={24} color="#22C55E" />}{expanded && <span>AveraCloud</span>}</div>
        <nav className="dash-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className={"dash-link" + (location.pathname === l.to ? " active" : "")} title={l.label}>
              <l.icon size={18} />
              {expanded && <span>{l.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="dash-footer">
          {expanded && <div className="dash-email">{user?.email}</div>}
          {expanded && <button className="dash-logout" onClick={() => { logout(); navigate('/dashboard'); }}><LogOut size={16} />Keluar</button>}
        </div>
        <button className="dash-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
      {mobileOpen && <div className="dash-overlay" onClick={() => setMobileOpen(false)} />}
      <button className="dash-menu-btn" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
      <main className={"dash-main" + (collapsed && !hovered ? " full" : "")}>{children}</main>
      <style>{`
        .dash-layout{display:flex;min-height:100vh;background:#0a0f1e}
        .dash-sidebar{width:240px;min-width:240px;background:#111827;border-right:1px solid #1e293b;display:flex;flex-direction:column;padding:20px 0;position:fixed;top:0;left:0;bottom:0;z-index:50;transition:width .25s ease,min-width .25s ease,transform .25s ease;overflow:hidden}
        .dash-sidebar.collapsed{width:64px;min-width:64px}
        .dash-sidebar.collapsed .dash-link{justify-content:center;padding:12px 0;border-left:none}
        .dash-sidebar.collapsed .dash-link span{display:none}
        .dash-sidebar.collapsed .dash-logo span{display:none}
        .dash-sidebar.collapsed .dash-logo{justify-content:center;padding:0 0 20px}
        .dash-logo{padding:0 20px 20px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #1e293b;padding-bottom:16px;font-weight:700;font-size:16px;color:#f1f5f9;min-height:56px;transition:padding .25s ease}
        .dash-nav{flex:1;margin-top:12px}
        .dash-link{display:flex;align-items:center;gap:12px;padding:10px 20px;color:#94a3b8;font-size:14px;text-decoration:none;border-left:3px solid transparent;transition:all .2s;white-space:nowrap}
        .dash-link.active{color:#22C55E;background:rgba(34,197,94,.08);border-left-color:#22C55E}
        .dash-link:hover{color:#f1f5f9}
        .dash-footer{padding:0 20px;border-top:1px solid #1e293b;padding-top:12px;transition:padding .25s ease}
        .dash-sidebar.collapsed .dash-footer{padding:0 12px}
        .dash-email{font-size:12px;color:#94a3b8;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .dash-logout{display:flex;align-items:center;gap:8px;color:#ef4444;background:none;border:none;cursor:pointer;font-size:13px;padding:8px 0}
        .dash-sidebar.collapsed .dash-logout span,.dash-sidebar.collapsed .dash-email{display:none}
        .dash-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:40}
        .dash-menu-btn{display:none;position:fixed;top:16px;left:16px;z-index:30;background:#111827;border:1px solid #1e293b;border-radius:8px;padding:8px;color:#f1f5f9;cursor:pointer}
        .dash-main{flex:1;margin-left:240px;padding:24px;overflow-x:hidden;max-width:100%;box-sizing:border-box;transition:margin-left .25s ease}
        .dash-main.full{margin-left:64px}
        .dash-collapse-btn{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:#1e293b;border:1px solid #334155;border-radius:8px;padding:6px;cursor:pointer;color:#94a3b8;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:10}
        .dash-collapse-btn:hover{background:#334155;color:#f1f5f9}
        .dash-sidebar.collapsed .dash-collapse-btn{bottom:20px}
        @media(max-width:768px){
          .dash-sidebar{transform:translateX(-100%);transition:transform .3s}
          .dash-sidebar.open{transform:translateX(0)}
          .dash-main{margin-left:0!important;padding:60px 16px 24px}
          .dash-menu-btn{display:flex!important}
          .dash-overlay{display:block}
          .dash-collapse-btn{display:none}
        }
      `}</style>
    </div>
  );
}