import { useEffect, useState } from 'react';
import api from '../api';
import { Search, Filter, Download, Zap, Cpu, HardDrive, AlertCircle, CheckCircle, Clock, X, Info, ExternalLink, Grid, List } from 'lucide-react';

const STATUS_COLORS = {
  installing: { bg: 'rgba(251,191,36,.15)', color: '#fbbf24', icon: Clock },
  installed: { bg: 'rgba(34,197,94,.15)', color: '#22C55E', icon: CheckCircle },
  failed: { bg: 'rgba(239,68,68,.15)', color: '#ef4444', icon: AlertCircle }
};

const CATEGORY_ICONS = {
  'AI': '🤖',
  'AUTOMATION': '⚡',
  'DEV': '🔧',
  'MONITORING': '📊',
  'DATABASE': '💾',
  'MEDIA': '🎬'
};

export default function Apps() {
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [installedApps, setInstalledApps] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedServer, setSelectedServer] = useState('');
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load available apps
      const appsRes = await api('/api/apps');
      if (appsRes.success) {
        setApps(appsRes.data.apps || []);
        setCategories(appsRes.data.categories || []);
      }

      // Load installed apps
      const installedRes = await api('/api/apps/installed/list');
      if (installedRes.success) {
        setInstalledApps(installedRes.data || []);
      }

      // Load servers
      const serversRes = await api('/api/vps');
      if (serversRes.success) {
        const serverList = (serversRes.data || []).filter(s => s.status === 'running');
        setServers(serverList);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading apps:', err);
      setLoading(false);
    }
  }

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getInstalledStatus = (appId, serverId) => {
    return installedApps.find(ia => ia.app_id === appId && ia.server_id === serverId);
  };

  async function handleInstall() {
    if (!selectedApp || !selectedServer) return;

    setInstalling(true);
    try {
      const res = await api('/api/apps/install', {
        method: 'POST',
        body: JSON.stringify({
          serverId: selectedServer,
          appId: selectedApp.id
        })
      });

      if (res.success) {
        alert('Installation started! Check the Installed Apps tab for progress.');
        setShowInstallModal(false);
        setSelectedApp(null);
        setSelectedServer('');
        loadData(); // Refresh to show in-progress installation
      } else {
        alert('Failed to start installation: ' + (res.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setInstalling(false);
    }
  }

  async function handleUninstall(installId) {
    if (!confirm('Are you sure you want to uninstall this app? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await api(`/api/apps/installed/${installId}`, {
        method: 'DELETE'
      });

      if (res.success) {
        alert('App uninstalled successfully!');
        loadData();
      } else {
        alert('Failed to uninstall: ' + (res.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function openInstallModal(app) {
    if (servers.length === 0) {
      alert('No running servers available. Please start a server first.');
      return;
    }
    setSelectedApp(app);
    setSelectedServer(servers[0].id);
    setShowInstallModal(true);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <div style={{ color: '#94a3b8' }}>Loading apps...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
          App Marketplace
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          One-click install AI, automation, and development tools on your servers
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { icon: Download, label: 'Available Apps', value: apps.length, color: '#22C55E' },
          { icon: CheckCircle, label: 'Installed', value: installedApps.filter(ia => ia.status === 'installed').length, color: '#22C55E' },
          { icon: Clock, label: 'Installing', value: installedApps.filter(ia => ia.status === 'installing').length, color: '#fbbf24' },
          { icon: Zap, label: 'Active Servers', value: servers.length, color: '#3b82f6' }
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#111827', border: '1px solid #1e293b',
            borderRadius: 10, padding: '12px 16px', minWidth: 140
          }}>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid #1e293b', paddingBottom: 12 }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '8px 16px', background: selectedCategory === 'all' ? 'rgba(34,197,94,.15)' : 'transparent',
            color: selectedCategory === 'all' ? '#22C55E' : '#94a3b8', border: selectedCategory === 'all' ? '1px solid #22C55E' : '1px solid transparent',
            borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
          }}
        >
          All Apps ({apps.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            style={{
              padding: '8px 16px', background: selectedCategory === cat.key ? 'rgba(34,197,94,.15)' : 'transparent',
              color: selectedCategory === cat.key ? '#22C55E' : '#94a3b8', border: selectedCategory === cat.key ? '1px solid #22C55E' : '1px solid transparent',
              borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
            }}
          >
            {CATEGORY_ICONS[cat.key]} {cat.label}
          </button>
        ))}
      </div>

      {/* Search & View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 12px', flex: 1, maxWidth: 400 }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: '#f1f5f9', fontSize: 13, width: '100%'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '8px', background: viewMode === 'grid' ? 'rgba(34,197,94,.15)' : 'transparent',
              color: viewMode === 'grid' ? '#22C55E' : '#64748b', border: viewMode === 'grid' ? '1px solid #22C55E' : '1px solid #1e293b',
              borderRadius: 6, cursor: 'pointer'
            }}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px', background: viewMode === 'list' ? 'rgba(34,197,94,.15)' : 'transparent',
              color: viewMode === 'list' ? '#22C55E' : '#64748b', border: viewMode === 'list' ? '1px solid #22C55E' : '1px solid #1e293b',
              borderRadius: 6, cursor: 'pointer'
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Apps Grid/List */}
      {filteredApps.length === 0 ? (
        <div style={{
          background: '#111827', border: '1px solid #1e293b',
          borderRadius: 14, padding: 48, textAlign: 'center'
        }}>
          <Filter size={48} color="#1e293b" style={{ marginBottom: 16 }} />
          <h3 style={{ color: '#f1f5f9', marginBottom: 8 }}>No apps found</h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
          gap: 16
        }}>
          {filteredApps.map(app => {
            const installedOnServers = servers.filter(s => getInstalledStatus(app.id, s.id));
            const allInstalled = installedOnServers.length > 0 && installedOnServers.every(s => {
              const status = getInstalledStatus(app.id, s.id);
              return status && status.status === 'installed';
            });

            return (
              <div
                key={app.id}
                style={{
                  background: '#111827', border: '1px solid #1e293b',
                  borderRadius: 12, padding: 20, transition: 'border-color 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
              >
                {/* App Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 32 }}>{app.icon}</div>
                    <div>
                      <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                        {app.name}
                      </div>
                      <div style={{ color: '#22C55E', fontSize: 11, fontWeight: 600 }}>
                        {CATEGORY_ICONS[app.category]} {categories.find(c => c.key === app.category)?.label || app.category}
                      </div>
                    </div>
                  </div>
                  {allInstalled && (
                    <div style={{ background: 'rgba(34,197,94,.15)', color: '#22C55E', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={12} /> Installed
                    </div>
                  )}
                </div>

                {/* Description */}
                <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
                  {app.description}
                </p>

                {/* Requirements */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 11, color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Cpu size={12} />
                    {app.requirements.minCpu}+ cores
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HardDrive size={12} />
                    {app.requirements.minRam}+ GB RAM
                  </div>
                  {app.requirements.gpuRecommended && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24' }}>
                      <Zap size={12} />
                      GPU Recommended
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {selectedApp?.id === app.id && (
                  <div style={{ paddingTop: 16, borderTop: '1px solid #1e293b' }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>Installation Details</div>
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>
                        <div>• Port: {app.requirements.ports?.join(', ') || 'N/A'}</div>
                        <div>• Disk: {app.requirements.minDisk}+ GB</div>
                        <div>• Docker: {app.requirements.dockerRequired ? 'Required' : 'Not required'}</div>
                      </div>
                    </div>

                    {app.postInstallNotes && app.postInstallNotes.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>Post-Install Notes</div>
                        <ul style={{ color: '#94a3b8', fontSize: 12, margin: 0, paddingLeft: 16 }}>
                          {app.postInstallNotes.map((note, i) => (
                            <li key={i} style={{ marginBottom: 4 }}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <a
                        href={app.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          flex: 1, padding: '8px 12px', background: 'transparent',
                          color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 6,
                          cursor: 'pointer', fontSize: 12, textAlign: 'center', textDecoration: 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <ExternalLink size={14} /> Website
                      </a>
                      {servers.length > 0 && !allInstalled && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openInstallModal(app); }}
                          style={{
                            flex: 1, padding: '8px 12px', background: '#22C55E',
                            color: '#000', border: 'none', borderRadius: 6,
                            cursor: 'pointer', fontSize: 12, fontWeight: 600
                          }}
                        >
                          <Download size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                          Install
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Collapse hint */}
                {selectedApp?.id !== app.id && (
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Info size={12} /> Click for details
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Installed Apps Section */}
      {installedApps.length > 0 && (
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #1e293b' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>
            Installed Apps
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {installedApps.map(install => {
              const statusConfig = STATUS_COLORS[install.status] || STATUS_COLORS.installing;
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={install.id}
                  style={{
                    background: '#111827', border: '1px solid #1e293b',
                    borderRadius: 10, padding: 16
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>
                          {install.app_name}
                        </div>
                        <span style={{
                          padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600,
                          background: statusConfig.bg, color: statusConfig.color,
                          display: 'inline-flex', alignItems: 'center', gap: 4
                        }}>
                          <StatusIcon size={10} /> {install.status}
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>
                        {install.server_name} ({install.server_ip})
                      </div>
                    </div>
                    {install.status === 'installed' && (
                      <button
                        onClick={() => handleUninstall(install.id)}
                        style={{
                          padding: '6px 12px', background: 'rgba(239,68,68,.1)',
                          color: '#ef4444', border: '1px solid rgba(239,68,68,.2)',
                          borderRadius: 6, cursor: 'pointer', fontSize: 11
                        }}
                      >
                        Uninstall
                      </button>
                    )}
                  </div>

                  {install.port && install.status === 'installed' && (
                    <div style={{
                      background: '#0a0f1e', borderRadius: 6, padding: '8px 12px',
                      fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                      <span>Access at:</span>
                      <code style={{ color: '#22C55E', background: 'rgba(34,197,94,.08)', padding: '2px 6px', borderRadius: 4 }}>
                        http://{install.server_ip}:{install.port}
                      </code>
                    </div>
                  )}

                  {install.install_log && install.status === 'failed' && (
                    <div style={{
                      marginTop: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)',
                      borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#ef4444',
                      maxHeight: 100, overflow: 'auto'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Error Log:</div>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {install.install_log}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Install Modal */}
      {showInstallModal && selectedApp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: '#111827', border: '1px solid #1e293b',
            borderRadius: 16, padding: 28, width: '100%', maxWidth: 480
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#f1f5f9', fontSize: 18, margin: 0 }}>
                Install {selectedApp.name}
              </h3>
              <button
                onClick={() => { setShowInstallModal(false); setSelectedApp(null); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: 12, marginBottom: 6 }}>
                Select Server
              </label>
              <select
                value={selectedServer}
                onChange={e => setSelectedServer(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', background: '#0a0f1e',
                  color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 8,
                  fontSize: 14, outline: 'none'
                }}
              >
                {servers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.ip}) - {s.plan}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 24, padding: 12, background: '#0a0f1e', borderRadius: 8, fontSize: 12, color: '#94a3b8' }}>
              <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>Requirements:</div>
              <div>• {selectedApp.requirements.minCpu}+ CPU cores</div>
              <div>• {selectedApp.requirements.minRam}+ GB RAM</div>
              <div>• {selectedApp.requirements.minDisk}+ GB disk space</div>
              {selectedApp.requirements.dockerRequired && <div>• Docker required (will be installed)</div>}
              {selectedApp.requirements.gpuRecommended && <div style={{ color: '#fbbf24' }}>• GPU recommended for best performance</div>}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => { setShowInstallModal(false); setSelectedApp(null); }}
                style={{
                  flex: 1, padding: 10, background: 'transparent',
                  border: '1px solid #1e293b', color: '#f1f5f9',
                  borderRadius: 8, cursor: 'pointer', fontSize: 14
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleInstall}
                disabled={installing}
                style={{
                  flex: 1, padding: 10, background: '#22C55E', color: '#000',
                  border: 'none', borderRadius: 8, cursor: installing ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 600, opacity: installing ? 0.5 : 1
                }}
              >
                {installing ? 'Installing...' : 'Install Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
