import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'

type ViewId =
  | 'dashboard'
  | 'topology'
  | 'devices'
  | 'scans'
  | 'integrations'
  | 'agents'
  | 'icons'
  | 'settings'
  | 'help'

type Theme = 'dark' | 'light'

const VIEW_LABELS: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  topology: 'Topology',
  devices: 'Devices',
  scans: 'Scan uploads',
  integrations: 'Integrations',
  agents: 'Agents',
  icons: 'Icon library',
  settings: 'Settings',
  help: 'Documentation',
}

const NAV_GROUPS: { title: string; items: { id: ViewId; icon: string }[] }[] = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', icon: '⌂' },
      { id: 'topology', icon: '⌘' },
      { id: 'devices', icon: '▦' },
      { id: 'scans', icon: '⌁' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'integrations', icon: '↗' },
      { id: 'agents', icon: '◈' },
      { id: 'icons', icon: '✦' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'settings', icon: '⚙' },
      { id: 'help', icon: '?' },
    ],
  },
]

const AGENTS = [
  { name: 'HQ-Scanner-01', ip: '10.20.0.15', os: 'Ubuntu 24.04 LTS', date: '2026-09-18 09:42 UTC' },
  { name: 'Remote-Office-East', ip: '10.42.8.21', os: 'Debian 12', date: '2026-09-20 14:16 UTC' },
  { name: 'Cloud-Discovery-01', ip: '172.31.16.44', os: 'Rocky Linux 9', date: '2026-09-22 18:05 UTC' },
]

const THEME_KEY = 'brian-theme'

function readHashView(): ViewId {
  const hash = window.location.hash.slice(1) as ViewId
  return hash in VIEW_LABELS ? hash : 'dashboard'
}

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the theme still applies for this visit.
  }
}

function Empty({ mark, title, children }: { mark: string; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div>
        <div className="empty-mark">{mark}</div>
        <strong>{title}</strong>
        {children}
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<ViewId>(readHashView)
  const [theme, setTheme] = useState<Theme>(readStoredTheme)
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [integrationTab, setIntegrationTab] = useState<'NetBox' | 'Scan sources' | 'API access'>('NetBox')
  const [scanFile, setScanFile] = useState<string | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    document.body.dataset.theme = theme
    storeTheme(theme)
  }, [theme])

  useEffect(() => {
    window.history.replaceState(null, '', `#${view}`)
    document.title = `Brian | ${VIEW_LABELS[view]}`
  }, [view])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  function notify(message: string) {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  function go(next: ViewId) {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  function onScanFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setScanFile(file.name)
    notify(`Selected ${file.name}`)
  }

  return (
    <div className={`app${reducedMotion ? ' reduce-motion' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">B</span>
          <span>
            <span className="brand-name">brian</span>
            <span className="eyebrow">network intelligence</span>
          </span>
        </div>

        <nav>
          {NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-title">{group.title}</div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item${view === item.id ? ' active' : ''}`}
                  onClick={() => go(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {VIEW_LABELS[item.id]}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <strong>{VIEW_LABELS[view]}</strong>
          </div>
          <div className="top-actions">
            <label className="search">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search devices, IPs, tags..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  if (event.target.value) notify('Search is ready for connected data')
                }}
              />
            </label>
            <button
              className="icon-button"
              title="Toggle theme"
              aria-label="Toggle theme"
              onClick={() => {
                const next: Theme = theme === 'dark' ? 'light' : 'dark'
                setTheme(next)
                notify(next === 'dark' ? 'Dark theme enabled' : 'Light theme enabled')
              }}
            >
              ◐
            </button>
            <button className="icon-button" title="Notifications" aria-label="Notifications" onClick={() => notify('No new notifications')}>
              ♢
            </button>
            <button className="button primary" onClick={() => go('topology')}>
              Open topology
            </button>
          </div>
        </header>

        <div className="content">
          {/* Dashboard */}
          <section className={`view${view === 'dashboard' ? ' active' : ''}`}>
            <div className="view-heading">
              <div className="actions">
                <button className="button" onClick={() => go('integrations')}>Connect source</button>
                <button className="button primary" onClick={() => go('devices')}>Add device</button>
              </div>
            </div>
            <div className="metric-grid">
              <div className="metric"><span className="eyebrow">Devices</span><strong className="metric-value">0</strong><span className="metric-note">No inventory imported</span></div>
              <div className="metric"><span className="eyebrow">Connections</span><strong className="metric-value">0</strong><span className="metric-note">Topology is empty</span></div>
              <div className="metric"><span className="eyebrow">Data sources</span><strong className="metric-value">0</strong><span className="metric-note">NetBox or agents offline</span></div>
              <div className="metric"><span className="eyebrow">Last scan</span><strong className="metric-value">--</strong><span className="metric-note">Awaiting first discovery</span></div>
            </div>
            <div className="dashboard-grid">
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Recent activity</h2>
                    <p>Syncs, imports, and topology changes</p>
                  </div>
                  <button className="button ghost" onClick={() => go('scans')}>View scans →</button>
                </div>
                <Empty mark="⌁" title="No activity yet">
                  <p>Connect NetBox or upload a scan to begin building your topology.</p>
                </Empty>
              </div>
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2>Getting started</h2>
                    <p>A short path to your first topology</p>
                  </div>
                </div>
                <div className="activity">
                  <div className="activity-row">
                    <span className="dot" />
                    <div><strong>Connect a data source</strong><small>NetBox, scanner, or manual entry</small></div>
                    <span>→</span>
                  </div>
                  <div className="activity-row">
                    <span className="dot" style={{ background: 'var(--cyan)' }} />
                    <div><strong>Review your devices</strong><small>Search, tag, and categorize assets</small></div>
                    <span>→</span>
                  </div>
                  <div className="activity-row">
                    <span className="dot" style={{ background: 'var(--amber)' }} />
                    <div><strong>Arrange the topology</strong><small>Choose a layout and save positions</small></div>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Topology */}
          <section className={`view${view === 'topology' ? ' active' : ''}`}>
            <div className="view-heading">
              <div className="actions">
                <button className="button" onClick={() => notify('Export is available once data is connected')}>Export</button>
                <button className="button primary" onClick={() => notify('Add connection: select two devices first')}>Add connection</button>
              </div>
            </div>
            <div className="topology-shell">
              <aside className="topology-sidebar">
                <div className="eyebrow">View controls</div>
                <div className="field" style={{ marginTop: 15 }}>
                  <label htmlFor="layout">Layout</label>
                  <select id="layout" defaultValue="Hierarchical">
                    <option>Hierarchical</option>
                    <option>Force-directed</option>
                    <option>Radial</option>
                    <option>Breadth-first</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="group">Group by</label>
                  <select id="group" defaultValue="None">
                    <option>None</option>
                    <option>Site</option>
                    <option>Network</option>
                    <option>Device type</option>
                    <option>Function</option>
                  </select>
                </div>
                <label className="check"><input type="checkbox" defaultChecked /> Show grid</label>
                <label className="check"><input type="checkbox" /> Snap to grid</label>
                <label className="check"><input type="checkbox" defaultChecked /> Show labels</label>
                <div className="filter-section">
                  <h3>Filters</h3>
                  <div className="filter-option"><span>Online</span><span>0</span></div>
                  <div className="filter-option"><span>Offline</span><span>0</span></div>
                  <div className="filter-option"><span>Unknown</span><span>0</span></div>
                  <button className="button ghost" onClick={() => notify('Filter management is coming soon')}>Manage filters →</button>
                </div>
              </aside>

              <div className="canvas-area">
                <div className="canvas-toolbar">
                  <div className="toolbar-cluster">
                    <button className="toolbar-button" title="Zoom out" onClick={() => notify('Nothing to zoom yet')}>−</button>
                    <button className="toolbar-button" title="Zoom in" onClick={() => notify('Nothing to zoom yet')}>＋</button>
                    <button className="toolbar-button" title="Fit to screen" onClick={() => notify('Nothing to fit yet')}>⌗</button>
                    <button className="toolbar-button" title="Reset layout" onClick={() => notify('Layout reset')}>↻</button>
                  </div>
                  <div className="toolbar-cluster">
                    <button className="toolbar-button selected" title="Select">↖</button>
                    <button className="toolbar-button" title="Pan" onClick={() => notify('Pan mode')}>✥</button>
                    <button className="toolbar-button" title="Add node" onClick={() => go('devices')}>＋</button>
                  </div>
                </div>
                <div className="canvas-empty">
                  <div className="canvas-empty-inner">
                    <div className="empty-mark" style={{ background: 'var(--panel)' }}>⌘</div>
                    <h2>Your topology is empty</h2>
                    <p className="muted">Import infrastructure, add a device manually, or connect an agent to see relationships here.</p>
                    <div className="actions" style={{ justifyContent: 'center' }}>
                      <button className="button primary" onClick={() => go('devices')}>Add first device</button>
                      <button className="button" onClick={() => go('integrations')}>Connect source</button>
                    </div>
                  </div>
                </div>
                <div className="canvas-legend">
                  <div className="eyebrow">Legend</div>
                  <div className="legend-item"><span className="line" /> Direct link</div>
                  <div className="legend-item"><span className="line dashed" /> Inferred link</div>
                </div>
              </div>

              <aside className="details-panel">
                <div className="eyebrow">Inspector</div>
                <Empty mark="◇" title="Nothing selected">
                  <p>Select a node or connection to inspect its details.</p>
                </Empty>
              </aside>
            </div>
          </section>

          {/* Devices */}
          <section className={`view${view === 'devices' ? ' active' : ''}`}>
            <div className="view-heading">
              <div className="actions">
                <button className="button" onClick={() => go('scans')}>Bulk import</button>
                <button className="button primary" onClick={() => notify('Device form opens here once the API is connected')}>＋ Add device</button>
              </div>
            </div>
            <div className="card table-card">
              <div className="table-tools">
                <label className="search" style={{ width: 280 }}>
                  <span>⌕</span>
                  <input type="search" placeholder="Filter device inventory" />
                </label>
                <div className="actions">
                  <select style={{ width: 140 }} defaultValue="All statuses">
                    <option>All statuses</option>
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Unknown</option>
                  </select>
                  <button className="button" onClick={() => notify('Saved views are coming soon')}>Saved views</button>
                </div>
              </div>
              <Empty mark="▦" title="No devices found">
                <p>Add a device manually or import a source to populate the inventory.</p>
                <button className="button primary" style={{ marginTop: 8 }} onClick={() => notify('Device form opens here once the API is connected')}>
                  Create device
                </button>
              </Empty>
            </div>
          </section>

          {/* Integrations */}
          <section className={`view${view === 'integrations' ? ' active' : ''}`}>
            <div className="view-heading">
              <button className="button primary" onClick={() => notify('Choose a source type to add')}>＋ Add integration</button>
            </div>
            <div className="tabs">
              {(['NetBox', 'Scan sources', 'API access'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`tab${integrationTab === tab ? ' active' : ''}`}
                  onClick={() => setIntegrationTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2>NetBox connection</h2>
                  <p>Read-only synchronization of devices, sites, interfaces, and IP addresses.</p>
                </div>
                <span className="badge">Not connected</span>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="netbox-url">NetBox URL</label>
                  <input id="netbox-url" placeholder="https://netbox.example.com" />
                </div>
                <div className="field">
                  <label htmlFor="netbox-token">API token</label>
                  <input id="netbox-token" type="password" placeholder="Enter token securely" autoComplete="off" />
                </div>
                <div className="field">
                  <label htmlFor="sync-interval">Sync interval</label>
                  <select id="sync-interval" defaultValue="Every 1 hour">
                    <option>Every 1 hour</option>
                    <option>Every 6 hours</option>
                    <option>Every 12 hours</option>
                    <option>Every 24 hours</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="conflict">Conflict policy</label>
                  <select id="conflict" defaultValue="Manual merge">
                    <option>Manual merge</option>
                    <option>Timestamp wins</option>
                    <option>NetBox preference</option>
                  </select>
                </div>
                <div className="wide actions">
                  <button className="button" onClick={() => notify('Connection test requires the API')}>Test connection</button>
                  <button className="button primary" onClick={() => notify('Configuration saved locally')}>Save configuration</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h2>Connected agents</h2>
                  <p>Agents reporting to this Brian instance.</p>
                </div>
                <span className="badge online">{AGENTS.length} connected</span>
              </div>
              <div className="table-wrap">
                <table className="agent-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>IP Address</th>
                      <th>System OS</th>
                      <th>Connection Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AGENTS.map((agent) => (
                      <tr key={agent.name}>
                        <td><div className="agent-name"><strong>{agent.name}</strong></div></td>
                        <td className="agent-ip">{agent.ip}</td>
                        <td className="agent-os">{agent.os}</td>
                        <td className="agent-date">{agent.date}</td>
                        <td>
                          <div className="agent-actions">
                            <button className="agent-action remove" title={`Remove ${agent.name}`} aria-label={`Remove ${agent.name}`} onClick={() => notify(`Remove ${agent.name}`)}>⛔</button>
                            <button className="agent-action" title={`Refresh ${agent.name}`} aria-label={`Refresh ${agent.name}`} onClick={() => notify(`Refreshing ${agent.name}`)}>⟳</button>
                            <button className="agent-action" title={`Edit ${agent.name}`} aria-label={`Edit ${agent.name}`} onClick={() => notify(`Editing ${agent.name}`)}>✎</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Agents */}
          <section className={`view${view === 'agents' ? ' active' : ''}`}>
            <div className="view-heading">
              <button className="button primary" onClick={() => notify('Agent registration is coming soon')}>＋ Register agent</button>
            </div>
            <div className="card table-card">
              <div className="table-tools">
                <div>
                  <strong>Registered agents</strong>
                  <div className="muted small">Heartbeat thresholds: online 5m · degraded 1h · offline after 1h</div>
                </div>
                <div className="actions">
                  <select style={{ width: 140 }}><option>All locations</option></select>
                  <select style={{ width: 130 }}><option>All statuses</option></select>
                </div>
              </div>
              <Empty mark="◈" title="No agents registered">
                <p>Register a distributed scanner to discover devices outside the central server's network.</p>
                <button className="button primary" style={{ marginTop: 8 }} onClick={() => notify('Agent registration is coming soon')}>
                  Register first agent
                </button>
              </Empty>
            </div>
          </section>

          {/* Scans */}
          <section className={`view${view === 'scans' ? ' active' : ''}`}>
            <div className="view-heading" />
            <div className="card">
              <div className="card-header">
                <div>
                  <h2>Upload scan results</h2>
                  <p>Supported sources: nmap XML, dnsrecon JSON/XML, Ettercap data, and generic JSON.</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="scan-source">Scan source</label>
                  <select id="scan-source" defaultValue="Nmap XML">
                    <option>Nmap XML</option>
                    <option>Dnsrecon JSON/XML</option>
                    <option>Ettercap</option>
                    <option>Custom JSON</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="conflict-resolution">Conflict resolution</label>
                  <select id="conflict-resolution" defaultValue="Merge">
                    <option>Merge</option>
                    <option>Replace</option>
                    <option>Review conflicts</option>
                  </select>
                </div>
                <div className="wide drop-zone">
                  <div className="empty-mark" style={{ margin: '0 auto 10px' }}>↑</div>
                  <strong>{scanFile ?? 'Drop a scan file here'}</strong>
                  <p>or browse from your computer</p>
                  <label className="button" style={{ cursor: 'pointer' }}>
                    Choose file
                    <input type="file" accept=".xml,.json" onChange={onScanFileChange} hidden />
                  </label>
                </div>
                <div className="wide actions">
                  <button className="button primary" disabled={!scanFile}>Preview parsed data</button>
                </div>
              </div>
            </div>
            <div className="card table-card">
              <div className="section-title">
                <div>
                  <h2 style={{ margin: 0 }}>Recent scan results</h2>
                  <span>Raw data and import summaries</span>
                </div>
                <button className="button" onClick={() => notify('No history to export yet')}>Export history</button>
              </div>
              <Empty mark="⌁" title="No scans uploaded">
                <p>Completed imports and validation errors will be listed here.</p>
              </Empty>
            </div>
          </section>

          {/* Icons */}
          <section className={`view${view === 'icons' ? ' active' : ''}`}>
            <div className="view-heading">
              <button className="button primary" onClick={() => notify('Icon upload is coming soon')}>↑ Upload icon</button>
            </div>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2>Built-in icons</h2>
                  <p>Custom icons can be mapped to a device type or individual device.</p>
                </div>
                <span className="badge">0 custom icons</span>
              </div>
              <Empty mark="✦" title="No custom icons added">
                <p>The built-in library will appear here when the frontend is connected to the API.</p>
                <button className="button" style={{ marginTop: 8 }} onClick={() => notify('Icon upload is coming soon')}>Upload SVG or PNG</button>
              </Empty>
            </div>
          </section>

          {/* Settings */}
          <section className={`view${view === 'settings' ? ' active' : ''}`}>
            <div className="view-heading">
              <button className="button primary" onClick={() => notify('Settings saved')}>Save changes</button>
            </div>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2>Appearance</h2>
                  <p>Keep the workspace comfortable during long operations.</p>
                </div>
              </div>
              <div className="setting-row">
                <div className="setting-copy">
                  <strong>Dark theme</strong>
                  <span>Use the low-glare control room palette by default.</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
                  />
                  <span className="slider" />
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-copy">
                  <strong>Reduced motion</strong>
                  <span>Limit transitions and non-essential animation.</span>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={reducedMotion} onChange={(event) => setReducedMotion(event.target.checked)} />
                  <span className="slider" />
                </label>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <div>
                  <h2>Topology defaults</h2>
                  <p>Set the starting presentation for new sessions.</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="default-layout">Default layout</label>
                  <select id="default-layout" defaultValue="Hierarchical">
                    <option>Hierarchical</option>
                    <option>Force-directed</option>
                    <option>Radial</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="default-group">Default grouping</label>
                  <select id="default-group" defaultValue="None">
                    <option>None</option>
                    <option>Site</option>
                    <option>Network</option>
                    <option>Device type</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Help */}
          <section className={`view${view === 'help' ? ' active' : ''}`}>
            <div className="view-heading">
              <button className="button" onClick={() => notify('API reference is coming soon')}>Open API reference</button>
            </div>
            <div className="help-grid">
              <HelpCard step="01 / Start" title="First topology">
                Connect NetBox or add a device manually, then use the topology canvas to arrange and inspect relationships.
              </HelpCard>
              <HelpCard step="02 / Discover" title="Scan ingestion">
                Upload nmap, dnsrecon, Ettercap, or generic JSON output and review the parsed preview before importing.
              </HelpCard>
              <HelpCard step="03 / Extend" title="Distributed agents">
                Register an outbound-only agent for remote subnets. Heartbeats and scan provenance remain visible centrally.
              </HelpCard>
              <HelpCard step="04 / Secure" title="API tokens">
                Use scoped bearer tokens, keep production traffic behind HTTPS, and never expose credentials in logs.
              </HelpCard>
              <HelpCard step="05 / Operate" title="State semantics">
                Operational state is shown through color, borders, icons, labels, and opacity so meaning is not color-dependent.
              </HelpCard>
              <HelpCard step="06 / Export" title="Evidence and reports">
                Export filtered inventory as CSV/JSON or render the current topology as SVG/PNG for documentation.
              </HelpCard>
            </div>
          </section>
        </div>
      </main>

      <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
        {toast ?? ''}
      </div>
    </div>
  )
}

function HelpCard({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <div className="card help-card">
      <div className="eyebrow">{step}</div>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  )
}
