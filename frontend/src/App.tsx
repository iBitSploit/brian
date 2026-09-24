import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Boxes,
  Cable,
  Check,
  ChevronRight,
  CircleHelp,
  Cloud,
  Database,
  FileUp,
  Filter,
  Gauge,
  HardDrive,
  LayoutDashboard,
  Moon,
  Network,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Sun,
  Trash2,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react'

type View = 'dashboard' | 'topology' | 'devices' | 'integrations' | 'agents' | 'scans' | 'icons' | 'settings' | 'help'
type AgentStatus = 'Online' | 'Degraded' | 'Offline'

type Agent = {
  name: string
  ip: string
  os: string
  connectionDate: string
  location: string
  status: AgentStatus
}

const agents: Agent[] = [
  { name: 'HQ-Scanner-01', ip: '10.20.0.15', os: 'Ubuntu 24.04 LTS', connectionDate: '2026-09-18 09:42 UTC', location: 'Headquarters', status: 'Online' },
  { name: 'Remote-Office-East', ip: '10.42.8.21', os: 'Debian 12', connectionDate: '2026-09-20 14:16 UTC', location: 'Remote office', status: 'Degraded' },
  { name: 'Cloud-Discovery-01', ip: '172.31.16.44', os: 'Rocky Linux 9', connectionDate: '2026-09-22 18:05 UTC', location: 'Cloud VPC', status: 'Offline' },
]

const navGroups = [
  { label: 'Workspace', items: [['dashboard', 'Dashboard', LayoutDashboard], ['topology', 'Topology', Network], ['devices', 'Devices', Boxes], ['scans', 'Scan uploads', FileUp]] },
  { label: 'Operations', items: [['integrations', 'Integrations', Cable], ['agents', 'Agents', Users], ['icons', 'Icon library', Shield]] },
  { label: 'System', items: [['settings', 'Settings', Settings], ['help', 'Documentation', CircleHelp]] },
] as const

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [dark, setDark] = useState(() => localStorage.getItem('brian-theme') !== 'light')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('brian-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2200)
    return () => window.clearTimeout(timer)
  }, [notice])

  const go = (next: View) => setView(next)
  const action = (message: string) => setNotice(message)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">B</span>
          <span><strong>brian</strong><small>network intelligence</small></span>
        </div>
        <nav className="nav-stack" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-label">{group.label}</p>
              {group.items.map(([id, label, Icon]) => (
                <button className={`nav-item ${view === id ? 'active' : ''}`} key={id} onClick={() => go(id as View)}>
                  <Icon size={16} />{label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-status">
          <p className="nav-label">System status</p>
          <span><i className="status-dot online" /> Brian API ready</span>
          <span><i className="status-dot cyan" /> Mock data mode</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{viewTitle(view)}</strong></div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search devices, IPs, tags..." /></label>
            <button className="icon-button" title="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button className="icon-button" title="Notifications" onClick={() => action('No new notifications')}><Activity size={17} /></button>
            <button className="button primary" onClick={() => go('topology')}>Open topology</button>
          </div>
        </header>

        <div className="page-content">
          {view === 'dashboard' && <Dashboard go={go} />}
          {view === 'topology' && <Topology go={go} action={action} />}
          {view === 'devices' && <Devices action={action} />}
          {view === 'integrations' && <Integrations action={action} />}
          {view === 'agents' && <Agents action={action} />}
          {view === 'scans' && <Scans action={action} />}
          {view === 'icons' && <Icons action={action} />}
          {view === 'settings' && <SettingsView dark={dark} setDark={setDark} action={action} />}
          {view === 'help' && <Help />}
        </div>
      </main>
      {notice && <div className="toast"><Check size={15} />{notice}</div>}
    </div>
  )
}

function viewTitle(view: View) {
  return { dashboard: 'Dashboard', topology: 'Topology', devices: 'Devices', integrations: 'Integrations', agents: 'Agents', scans: 'Scan uploads', icons: 'Icon library', settings: 'Settings', help: 'Documentation' }[view]
}

function Heading({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <div className="view-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lede">{description}</p></div>{children && <div className="actions">{children}</div>}</div>
}

function Dashboard({ go }: { go: (view: View) => void }) {
  return <>
    <Heading eyebrow="Overview / 24 September 2026" title="Infrastructure at a glance" description="A quiet control room for discovering, understanding, and operating your network.">
      <button className="button" onClick={() => go('integrations')}>Connect source</button><button className="button primary" onClick={() => go('devices')}>Add device</button>
    </Heading>
    <div className="metrics"><Metric label="Devices" value="0" note="No inventory imported" /><Metric label="Connections" value="0" note="Topology is empty" /><Metric label="Data sources" value="3" note="Mock agents connected" /><Metric label="Last scan" value="--" note="Awaiting first discovery" /></div>
    <div className="dashboard-grid"><Card title="Recent activity" subtitle="Syncs, imports, and topology changes"><Empty icon={<Activity />} title="No activity yet" text="Connect NetBox or upload a scan to begin building your topology." /></Card><Card title="Getting started" subtitle="A short path to your first topology"><div className="activity-list"><ActivityStep color="green" title="Connect a data source" text="NetBox, scanner, or manual entry" /><ActivityStep color="cyan" title="Review your devices" text="Search, tag, and categorize assets" /><ActivityStep color="amber" title="Arrange the topology" text="Choose a layout and save positions" /></div></Card></div>
  </>
}

function Topology({ go, action }: { go: (view: View) => void; action: (message: string) => void }) {
  return <><Heading eyebrow="Workspace / Graph" title="Topology" description="Map relationships, interfaces, and operational state on a focused canvas"><button className="button" onClick={() => action('Topology export queued')}>Export</button><button className="button primary" onClick={() => action('Connection editor opened')}>Add connection</button></Heading><div className="topology-shell"><aside className="topology-controls"><p className="nav-label">View controls</p><Field label="Layout"><select><option>Hierarchical</option><option>Force-directed</option><option>Radial</option><option>Breadth-first</option></select></Field><Field label="Group by"><select><option>None</option><option>Site</option><option>Network</option><option>Device type</option></select></Field><CheckBox label="Show grid" checked /><CheckBox label="Snap to grid" /><CheckBox label="Show labels" checked /><div className="filter-box"><strong>Filters</strong><span>Online <b>0</b></span><span>Offline <b>0</b></span><span>Unknown <b>0</b></span><button className="link-button" onClick={() => action('Filter manager opened')}>Manage filters <ChevronRight size={13} /></button></div></aside><div className="canvas"><div className="canvas-tools"><span><button className="tool-button" onClick={() => action('Zoomed out')}>−</button><button className="tool-button" onClick={() => action('Zoomed in')}>＋</button><button className="tool-button" onClick={() => action('Fit to screen')}>⌗</button><button className="tool-button" onClick={() => action('Layout reset')}>↻</button></span><span><button className="tool-button active">↖</button><button className="tool-button" onClick={() => action('Pan mode enabled')}>✥</button><button className="tool-button" onClick={() => go('devices')}>＋</button></span></div><div className="canvas-empty"><div><div className="empty-mark"><Network size={21} /></div><h2>Your topology is empty</h2><p>Import infrastructure, add a device manually, or connect an agent to see relationships here.</p><button className="button primary" onClick={() => go('devices')}>Add first device</button></div></div><div className="legend"><span><i className="legend-line" /> Direct link</span><span><i className="legend-line dashed" /> Inferred link</span></div></div><aside className="inspector"><p className="nav-label">Inspector</p><Empty icon={<Search />} title="Nothing selected" text="Select a node or connection to inspect details." /></aside></div></>
}

function Devices({ action }: { action: (message: string) => void }) {
  return <><Heading eyebrow="Inventory / Assets" title="Devices" description="The source of truth for discovered and manually managed infrastructure"><button className="button" onClick={() => action('Bulk import opened')}>Bulk import</button><button className="button primary" onClick={() => action('Device form opened')}>Add device</button></Heading><Card><div className="table-toolbar"><label className="search-box"><Search size={15} /><input placeholder="Filter device inventory" /></label><button className="button" onClick={() => action('Saved views opened')}><Filter size={14} />Saved views</button></div><Empty icon={<Boxes />} title="No devices found" text="Add a device manually or import a source to populate the inventory." /></Card></>
}

function Integrations({ action }: { action: (message: string) => void }) {
  return <><Heading eyebrow="Operations / Sources" title="Integrations" description="Connect inventory and reconnaissance systems to Brian"><button className="button primary" onClick={() => action('Integration picker opened')}><Plus size={15} />Add integration</button></Heading><div className="tabs"><button className="tab active">NetBox</button><button className="tab">Scan sources</button><button className="tab">API access</button></div><Card title="NetBox connection" subtitle="Read-only synchronization of devices, sites, interfaces, and IP addresses"><div className="form-grid"><Field label="NetBox URL"><input placeholder="https://netbox.example.com" /></Field><Field label="API token"><input type="password" placeholder="Enter token securely" /></Field><Field label="Sync interval"><select><option>Every 1 hour</option><option>Every 6 hours</option><option>Every 12 hours</option><option>Every 24 hours</option></select></Field><Field label="Conflict policy"><select><option>Manual merge</option><option>Timestamp wins</option><option>NetBox preference</option></select></Field></div><div className="actions"><button className="button" onClick={() => action('Connection test completed')}>Test connection</button><button className="button primary" onClick={() => action('NetBox configuration saved')}>Save configuration</button></div></Card><AgentTable action={action} /></>
}

function AgentTable({ action }: { action: (message: string) => void }) {
  return <Card title="Connected agents" subtitle="Agents reporting to this Brian instance."><div className="table-scroll"><table><thead><tr><th>Name</th><th>IP Address</th><th>System OS</th><th>Connection Date</th><th>Actions</th></tr></thead><tbody>{agents.map((agent) => <tr key={agent.name}><td><strong className="agent-name"><i className={`status-dot ${agent.status.toLowerCase()}`} />{agent.name}</strong></td><td>{agent.ip}</td><td>{agent.os}</td><td>{agent.connectionDate}</td><td><div className="row-actions"><IconAction icon={<Trash2 />} label={`Remove ${agent.name}`} danger action={action} /><IconAction icon={<RefreshCw />} label={`Refresh ${agent.name}`} action={action} /><IconAction icon={<Pencil />} label={`Edit ${agent.name}`} action={action} /></div></td></tr>)}</tbody></table></div></Card>
}

function Agents({ action }: { action: (message: string) => void }) {
  return <><Heading eyebrow="Operations / Distributed discovery" title="Agents" description="Deploy scanners near remote subnets and keep their health visible."><button className="button primary" onClick={() => action('Agent registration opened')}><Plus size={15} />Register agent</button></Heading><AgentTable action={action} /></>
}

function Scans({ action }: { action: (message: string) => void }) {
  return <><Heading eyebrow="Discovery / Imports" title="Scan uploads" description="Parse reconnaissance output, preview changes, and choose how findings merge into inventory" /><Card title="Upload scan results" subtitle="Supported sources: nmap XML, dnsrecon JSON/XML, Ettercap data, and generic JSON."><div className="form-grid"><Field label="Scan source"><select><option>Nmap XML</option><option>Dnsrecon JSON/XML</option><option>Ettercap</option><option>Custom JSON</option></select></Field><Field label="Conflict resolution"><select><option>Merge</option><option>Replace</option><option>Review conflicts</option></select></Field></div><div className="dropzone"><Upload size={22} /><strong>Drop a scan file here</strong><span>or browse from your computer</span><button className="button" onClick={() => action('File picker opened')}>Choose file</button></div><button className="button primary" disabled>Preview parsed data</button></Card><Card title="Recent scan results" subtitle="Raw data and import summaries"><Empty icon={<FileUp />} title="No scans uploaded" text="Completed imports and validation errors will be listed here." /></Card></>
}

function Icons({ action }: { action: (message: string) => void }) {
  return <><Heading eyebrow="System / Visual language" title="Icon library" description="Use consistent symbols to distinguish infrastructure types at a glance"><button className="button primary" onClick={() => action('Icon upload opened')}><Upload size={15} />Upload icon</button></Heading><Card title="Built-in icons" subtitle="Custom icons can be mapped to a device type or individual device."><Empty icon={<Shield />} title="No custom icons added" text="Upload SVG or PNG assets when the icon library is connected to the API." /></Card></>
}

function SettingsView({ dark, setDark, action }: { dark: boolean; setDark: (value: boolean) => void; action: (message: string) => void }) {
  return <><Heading eyebrow="System / Preferences" title="Settings" description="Configure how Brian looks, behaves, and stores operational preferences"><button className="button primary" onClick={() => action('Settings saved')}>Save changes</button></Heading><Card title="Appearance" subtitle="Keep the workspace comfortable during long operations."><Setting title="Dark theme" text="Use the low-glare control room palette by default." checked={dark} onChange={setDark} /><Setting title="System theme detection" text="Use the operating system preference when no choice is saved." /><Setting title="Reduced motion" text="Limit transitions and non-essential animation." /></Card><Card title="Topology defaults" subtitle="Set the starting presentation for new sessions."><div className="form-grid"><Field label="Default layout"><select><option>Hierarchical</option><option>Force-directed</option><option>Radial</option></select></Field><Field label="Default grouping"><select><option>None</option><option>Site</option><option>Network</option><option>Device type</option></select></Field></div></Card></>
}

function Help() {
  const cards = [['01 / Start', 'First topology', 'Connect NetBox or add a device manually, then arrange and inspect relationships.'], ['02 / Discover', 'Scan ingestion', 'Upload nmap, dnsrecon, Ettercap, or generic JSON and review the parsed preview.'], ['03 / Extend', 'Distributed agents', 'Register outbound-only agents for remote subnets and track their provenance.'], ['04 / Secure', 'API tokens', 'Use scoped bearer tokens, HTTPS, and redacted operational logs.'], ['05 / Operate', 'State semantics', 'State is shown through color, borders, icons, labels, and opacity.'], ['06 / Export', 'Evidence and reports', 'Export filtered inventory as CSV/JSON or render topology as SVG/PNG.']]
  return <><Heading eyebrow="Reference / Brian" title="Documentation" description="The essential paths for operating a self-hosted topology workspace"><button className="button" onClick={() => window.open('/api/v1', '_blank')}>Open API reference</button></Heading><div className="help-grid">{cards.map(([eyebrow, title, text]) => <Card key={title}><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="muted">{text}</p></Card>)}</div></>
}

function Card({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode }) {
  return <section className="card">{title && <div className="card-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>}{children}</section>
}
function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <div className="metric"><p className="eyebrow">{label}</p><strong>{value}</strong><span>{note}</span></div> }
function Empty({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="empty"><div className="empty-mark">{icon}</div><strong>{title}</strong><p>{text}</p></div> }
function ActivityStep({ color, title, text }: { color: string; title: string; text: string }) { return <div className="activity-step"><i className={`status-dot ${color}`} /><div><strong>{title}</strong><small>{text}</small></div><ChevronRight size={15} /></div> }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label> }
function CheckBox({ label, checked }: { label: string; checked?: boolean }) { return <label className="check"><input type="checkbox" defaultChecked={checked} />{label}</label> }
function IconAction({ icon, label, danger, action }: { icon: React.ReactNode; label: string; danger?: boolean; action: (message: string) => void }) { return <button className={`icon-action ${danger ? 'danger' : ''}`} title={label} aria-label={label} onClick={() => action(`${label} selected`)}>{icon}</button> }
function Setting({ title, text, checked, onChange }: { title: string; text: string; checked?: boolean; onChange?: (value: boolean) => void }) { return <div className="setting"><div><strong>{title}</strong><span>{text}</span></div><label className="switch"><input type="checkbox" checked={checked} onChange={(event) => onChange?.(event.target.checked)} /><i /></label></div> }

export default App
