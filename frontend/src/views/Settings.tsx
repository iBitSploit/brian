import { useState } from 'react'
import { Card, Btn, Switch, Tabs, Field, SettingRow, Eyebrow, Mono } from '../components/shared'
import type { Theme } from '../App'

export function SettingsView({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const [tab, setTab] = useState('Appearance')
  const [dark, setDark] = useState(theme === 'dark')
  const [sysDetect, setSysDetect] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [showNodeIPs, setShowNodeIPs] = useState(true)
  const [showEdgeLabels, setShowEdgeLabels] = useState(false)
  const [autoLayout, setAutoLayout] = useState(true)
  const [defaultLayout, setDefaultLayout] = useState('Hierarchical')
  const [defaultGroup, setDefaultGroup] = useState('None')
  const [syncInterval, setSyncInterval] = useState('Every 1 hour')
  const [dedup, setDedup] = useState(true)
  const [scanHistory, setScanHistory] = useState('90')
  const [heartbeatLog, setHeartbeatLog] = useState('30')
  const [serverUrl, setServerUrl] = useState('https://brian.internal.corp')
  const [port, setPort] = useState('3000')
  const [logLevel, setLogLevel] = useState('info')
  const [tls, setTls] = useState(true)
  const [saved, setSaved] = useState(false)

  function handleDark(v: boolean) {
    setDark(v)
    setTheme(v ? 'dark' : 'light')
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section className="view-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, letterSpacing: '-.03em' }}>Settings</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Application preferences, defaults, and server configuration.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ color: 'var(--accent)', fontSize: 13 }}>✓ Saved</span>}
          <Btn variant="primary" onClick={save}>Save changes</Btn>
        </div>
      </div>

      <Tabs tabs={['Appearance', 'Topology', 'Data & sync', 'Server']} active={tab} onChange={setTab} />

      {tab === 'Appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 3px' }}>Theme</h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>Keep the workspace comfortable during long operations.</p>
            </div>
            <SettingRow title="Dark theme" desc="Use the low-glare control room palette by default." control={<Switch checked={dark} onChange={handleDark} />} />
            <SettingRow title="System theme detection" desc="Follow the OS light/dark preference when no choice has been saved." control={<Switch checked={sysDetect} onChange={setSysDetect} />} />
            <SettingRow title="Reduced motion" desc="Disable non-essential transitions and animations throughout the UI." control={<Switch checked={reducedMotion} onChange={setReducedMotion} />} />
            <SettingRow title="Compact mode" desc="Reduce padding and row height in tables and panels for high-density viewing." control={<Switch checked={compactMode} onChange={setCompactMode} />} />
          </Card>

          <Card>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 3px' }}>Sidebar & navigation</h2>
            </div>
            <SettingRow title="Collapse sidebar by default" desc="Start with the navigation collapsed; expand on hover." control={<Switch checked={false} onChange={() => {}} />} />
            <SettingRow title="Show device counts in nav" desc="Display live counts next to Devices, Agents, etc." control={<Switch checked={true} onChange={() => {}} />} />
          </Card>
        </div>
      )}

      {tab === 'Topology' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 3px' }}>Canvas defaults</h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>Applied when opening a new topology session.</p>
            </div>
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }}>
              <Field label="Default layout">
                <select value={defaultLayout} onChange={e => setDefaultLayout(e.target.value)}>
                  {['Hierarchical', 'Force-directed', 'Radial', 'Breadth-first'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Default grouping">
                <select value={defaultGroup} onChange={e => setDefaultGroup(e.target.value)}>
                  {['None', 'Site', 'Network', 'Device type', 'Function'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <SettingRow title="Show IP addresses on nodes" desc="Display the primary IP address label beneath each topology node." control={<Switch checked={showNodeIPs} onChange={setShowNodeIPs} />} />
            <SettingRow title="Show edge interface labels" desc="Display source/destination interface identifiers on connection lines." control={<Switch checked={showEdgeLabels} onChange={setShowEdgeLabels} />} />
            <SettingRow title="Automatic layout on import" desc="Re-run layout algorithm after a successful scan or NetBox sync." control={<Switch checked={autoLayout} onChange={setAutoLayout} />} />
            <SettingRow title="Snap to grid" desc="Snap node positions to the nearest grid point when dragging." control={<Switch checked={false} onChange={() => {}} />} />
            <SettingRow title="Show grid by default" desc="Render the background alignment grid when opening the topology canvas." control={<Switch checked={true} onChange={() => {}} />} />
          </Card>

          <Card>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 3px' }}>Node display</h2>
            </div>
            <SettingRow title="Color by status" desc="Use accent/red/amber to indicate online, offline, and unknown devices." control={<Switch checked={true} onChange={() => {}} />} />
            <SettingRow title="Size nodes by connectivity" desc="Increase node radius proportional to connection count." control={<Switch checked={false} onChange={() => {}} />} />
            <SettingRow title="Show agent provenance" desc="Annotate nodes with which agent discovered them." control={<Switch checked={false} onChange={() => {}} />} />
          </Card>
        </div>
      )}

      {tab === 'Data & sync' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 3px' }}>NetBox sync</h2>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }}>
                <Field label="Sync interval">
                  <select value={syncInterval} onChange={e => setSyncInterval(e.target.value)}>
                    {['Every 15 minutes', 'Every 1 hour', 'Every 6 hours', 'Every 12 hours', 'Every 24 hours'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Conflict policy">
                  <select defaultValue="Manual merge">{['Manual merge', 'Timestamp wins', 'NetBox preference'].map(o => <option key={o}>{o}</option>)}</select>
                </Field>
              </div>
            </div>
            <SettingRow title="Deduplicate across agents" desc="Merge device records discovered by multiple agents using IP as the primary key." control={<Switch checked={dedup} onChange={setDedup} />} />
            <SettingRow title="Auto-create location from NetBox site" desc="Create a Brian location entry for each NetBox site during sync." control={<Switch checked={true} onChange={() => {}} />} />
          </Card>

          <Card>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 3px' }}>Retention</h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>Control how long historical data is kept.</p>
            </div>
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }}>
              <Field label="Scan history retention (days)">
                <select value={scanHistory} onChange={e => setScanHistory(e.target.value)}>
                  {['30', '60', '90', '180', '365', 'Forever'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Agent heartbeat log retention (days)">
                <select value={heartbeatLog} onChange={e => setHeartbeatLog(e.target.value)}>
                  {['7', '14', '30', '60', '90'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ padding: '0 18px 18px' }}>
              <Btn variant="danger">Purge all scan history</Btn>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 3px' }}>Export</h2>
            </div>
            <div style={{ padding: 18, display: 'flex', gap: 10 }}>
              <Btn>Export all devices (CSV)</Btn>
              <Btn>Export topology (JSON)</Btn>
              <Btn>Export topology (SVG)</Btn>
            </div>
          </Card>
        </div>
      )}

      {tab === 'Server' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 3px' }}>Server configuration</h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>Connection and network settings for the Brian server.</p>
            </div>
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }}>
              <Field label="Server URL"><input value={serverUrl} onChange={e => setServerUrl(e.target.value)} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }} /></Field>
              <Field label="Listening port"><input value={port} onChange={e => setPort(e.target.value)} type="number" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }} /></Field>
              <Field label="Log level">
                <select value={logLevel} onChange={e => setLogLevel(e.target.value)}>
                  {['error', 'warn', 'info', 'debug', 'trace'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <SettingRow title="TLS / HTTPS" desc="Terminate TLS at the application layer. Requires cert.pem and key.pem mounted." control={<Switch checked={tls} onChange={setTls} />} />
          </Card>

          <Card style={{ padding: 18 }}>
            <h2 style={{ margin: '0 0 4px' }}>Environment variables</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px' }}>Brian reads these variables at startup. Restart the server after changes.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['DATABASE_URL', 'postgresql://user:pass@db:5432/brian'], ['REDIS_URL', 'redis://redis:6379'], ['BRIAN_PORT', '3000'], ['BRIAN_LOG_LEVEL', 'info'], ['ICON_PATH', '/var/brian/icons/']].map(([k, v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 0, padding: '9px 12px', background: 'var(--panel-strong)', borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
                  <span style={{ color: 'var(--cyan)' }}>{k}</span>
                  <span style={{ color: 'var(--muted)' }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 18 }}>
            <h2 style={{ margin: '0 0 4px' }}>Server info</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Brian version', 'v0.9.1-alpha'], ['Node.js', '22.4.0'], ['PostgreSQL', '16.2'], ['Redis', '7.2.4'], ['Uptime', '4 d 11 h 23 min'], ['Memory', '312 MB / 1.5 GB']].map(([k, v]) => (
                <div key={k} style={{ padding: '10px 12px', background: 'var(--panel-strong)', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{k}</div>
                  <Mono>{v}</Mono>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </section>
  )
}
