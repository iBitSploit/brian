import { useState } from 'react'
import { AGENTS } from '../data'
import { Card, CardHeader, Btn, Badge, StatusDot, StatusBadge, Tabs, Field, Modal, Eyebrow, Mono } from '../components/shared'

function NetBoxTab() {
  const [url, setUrl] = useState('https://netbox.internal.corp')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [interval, setInterval] = useState('Every 1 hour')
  const [conflict, setConflict] = useState('Manual merge')
  const [autoSync, setAutoSync] = useState(true)
  const [testStatus, setTestStatus] = useState<null | 'ok' | 'fail'>(null)

  const iconMap = [
    { netboxType: 'server', brianIcon: 'Server (🖥)' },
    { netboxType: 'router', brianIcon: 'Router (🔀)' },
    { netboxType: 'firewall', brianIcon: 'Firewall (🛡)' },
    { netboxType: 'virtual-machine', brianIcon: 'Server (🖥)' },
    { netboxType: 'switch', brianIcon: 'Switch (🔌)' },
  ]

  return (
    <>
      <Card>
        <CardHeader
          title="NetBox connection"
          subtitle="Read-only synchronization of devices, sites, interfaces, and IP addresses."
          badge={<Badge variant="online">● Connected</Badge>}
        />
        <div style={{ padding: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px' }}>
            <Field label="NetBox URL">
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://netbox.example.com" />
            </Field>
            <Field label="API token">
              <div style={{ position: 'relative' }}>
                <input type={showToken ? 'text' : 'password'} value={token || 'netbox_api_••••••••••••••••'} onChange={e => setToken(e.target.value)} />
                <button onClick={() => setShowToken(!showToken)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 }}>{showToken ? 'Hide' : 'Show'}</button>
              </div>
            </Field>
            <Field label="Sync interval">
              <select value={interval} onChange={e => setInterval(e.target.value)}>
                {['Every 15 minutes', 'Every 1 hour', 'Every 6 hours', 'Every 12 hours', 'Every 24 hours'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Conflict policy">
              <select value={conflict} onChange={e => setConflict(e.target.value)}>
                {['Manual merge', 'Timestamp wins', 'NetBox preference'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} style={{ width: 'auto', accentColor: 'var(--accent)' }} />
                Enable automatic sync
              </label>
            </div>
          </div>

          {/* Sync status bar */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[['Last sync', '2026-09-24 08:00'], ['Next sync', '2026-09-24 09:00'], ['Devices synced', '18'], ['Sync errors', '0']].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                <strong style={{ fontSize: 13, color: v === '0' || v.includes('09:00') ? 'var(--text)' : 'var(--text)' }}>{v}</strong>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <Btn onClick={() => setTestStatus('ok')}>Test connection</Btn>
            <Btn>Sync now</Btn>
            <Btn variant="primary">Save configuration</Btn>
            {testStatus === 'ok' && <Badge variant="online">● Connection OK</Badge>}
            {testStatus === 'fail' && <Badge variant="error">Connection failed</Badge>}
            <Btn variant="danger" style={{ marginLeft: 'auto' }}>Disconnect</Btn>
          </div>
        </div>
      </Card>

      <Card style={{ marginTop: 18 }}>
        <CardHeader title="Device type → icon mapping" subtitle="Map NetBox device_type slugs to Brian icons." />
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>NetBox device_type</th><th>Brian icon</th><th></th></tr></thead>
            <tbody>
              {iconMap.map((row, i) => (
                <tr key={i}>
                  <td><Mono>{row.netboxType}</Mono></td>
                  <td>
                    <select defaultValue={row.brianIcon} style={{ width: 180 }}>
                      {['Server (🖥)', 'Router (🔀)', 'Firewall (🛡)', 'Switch (🔌)', 'Cloud (☁)', 'Workstation (💻)'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  <td><Btn variant="ghost" style={{ fontSize: 12, minHeight: 28, padding: '2px 8px' }}>Remove</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '12px 17px' }}>
            <Btn style={{ fontSize: 12 }}>＋ Add mapping</Btn>
          </div>
        </div>
      </Card>
    </>
  )
}

function AgentsTab() {
  const [showRegister, setShowRegister] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <>
      <Card>
        <CardHeader
          title="Connected agents"
          subtitle="Distributed scanners reporting to this Brian instance."
          badge={<Badge variant="online">{AGENTS.filter(a => a.status === 'online').length} online</Badge>}
          action={<Btn variant="primary" onClick={() => setShowRegister(true)}>＋ Register agent</Btn>}
        />
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Name</th><th>Location</th><th>IP</th><th>OS</th><th>Status</th><th>Last heartbeat</th><th>Last scan</th><th>Found</th><th>Targets</th><th></th></tr>
            </thead>
            <tbody>
              {AGENTS.map(agent => (
                <>
                  <tr key={agent.id} style={{ background: expandedId === agent.id ? 'var(--panel-soft)' : undefined }}>
                    <td><strong style={{ color: 'var(--text)' }}>{agent.name}</strong></td>
                    <td>{agent.location}</td>
                    <td><Mono>{agent.ip}</Mono></td>
                    <td>{agent.os}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StatusDot status={agent.status} />
                        <span style={{ textTransform: 'capitalize', fontSize: 12 }}>{agent.status}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{agent.lastHeartbeat}</td>
                    <td style={{ fontSize: 12 }}>{agent.lastScan.split(' ')[0]}</td>
                    <td>{agent.devicesFound}</td>
                    <td><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{agent.scanTargets}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setExpandedId(expandedId === agent.id ? null : agent.id)} style={{ width: 28, height: 28, border: '1px solid var(--border-bright)', borderRadius: 5, background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>⋯</button>
                        <button style={{ width: 28, height: 28, border: '1px solid var(--border-bright)', borderRadius: 5, background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>⟳</button>
                        <button style={{ width: 28, height: 28, border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', borderRadius: 5, background: 'var(--panel)', color: 'var(--red)', cursor: 'pointer', fontSize: 13 }}>✕</button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === agent.id && (
                    <tr key={`${agent.id}-exp`}>
                      <td colSpan={10} style={{ background: 'var(--panel-soft)', padding: '16px 18px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                          <div>
                            <Eyebrow style={{ display: 'block', marginBottom: 10 }}>Configuration</Eyebrow>
                            <Field label="Scan schedule"><input defaultValue={agent.scanSchedule} /></Field>
                            <Field label="Scan targets" style={{ marginTop: 10 }}><input defaultValue={agent.scanTargets} /></Field>
                            <Btn style={{ marginTop: 10 }}>Save</Btn>
                          </div>
                          <div>
                            <Eyebrow style={{ display: 'block', marginBottom: 10 }}>API token</Eyebrow>
                            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: 10, background: 'var(--bg)', borderRadius: 6, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              {agent.token}
                              <Btn variant="ghost" style={{ fontSize: 11, minHeight: 26, padding: '2px 8px' }}>Copy</Btn>
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <Eyebrow style={{ display: 'block', marginBottom: 8 }}>Docker command</Eyebrow>
                              <pre style={{ margin: 0, padding: 10, background: 'var(--bg)', borderRadius: 6, fontSize: 10, color: 'var(--muted)', overflowX: 'auto', fontFamily: "'IBM Plex Mono', monospace" }}>{`docker run -d \\
  -e NETVIZ_SERVER=https://brian.corp \\
  -e AGENT_TOKEN=${agent.token} \\
  -e AGENT_NAME="${agent.name}" \\
  brian-agent:latest`}</pre>
                            </div>
                          </div>
                          <div>
                            <Eyebrow style={{ display: 'block', marginBottom: 10 }}>Actions</Eyebrow>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <Btn>Trigger scan now</Btn>
                              <Btn>View scan logs</Btn>
                              <Btn variant="danger">Decommission agent</Btn>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showRegister && (
        <Modal title="Register new agent" onClose={() => setShowRegister(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Agent name"><input placeholder="e.g. DC2-Scanner" /></Field>
            <Field label="Location">
              <select defaultValue=""><option value="" disabled>Select location</option>{['HQ-DC1', 'HQ-Office', 'Remote-East', 'AWS-us-east-1', 'HQ-DC2'].map(l => <option key={l}>{l}</option>)}</select>
            </Field>
            <Field label="Scan targets"><input placeholder="10.0.0.0/24, 10.0.1.0/24" /></Field>
            <Field label="Scan schedule"><select defaultValue="0 */6 * * *">{['0 */1 * * *', '0 */6 * * *', '0 */12 * * *', '0 0 * * *'].map(o => <option key={o}>{o}</option>)}</select></Field>
            <Field label="Scan type">
              <select defaultValue="network"><option value="network">Network subnet</option><option value="hosts">Specific hosts</option><option value="services">Service probing</option></select>
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Eyebrow style={{ display: 'block', marginBottom: 8 }}>Generated API token</Eyebrow>
              <div style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                brn_newagent_8f3k2m9xpqr4
                <Btn variant="ghost" style={{ fontSize: 11, minHeight: 26, padding: '2px 8px' }}>Copy</Btn>
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
              <Btn variant="primary">Register agent</Btn>
              <Btn onClick={() => setShowRegister(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

function ApiTab() {
  const tokens = [
    { name: 'Nmap automation script', scope: 'scans:write, devices:read', created: '2026-09-10', last: '2 h ago' },
    { name: 'Grafana read-only', scope: 'devices:read, topology:read', created: '2026-08-22', last: '15 min ago' },
    { name: 'CI pipeline integration', scope: 'scans:write', created: '2026-09-01', last: '3 d ago' },
  ]
  return (
    <>
      <Card>
        <CardHeader title="API tokens" subtitle="Scoped bearer tokens for scripts, agents, and external integrations." action={<Btn variant="primary">Generate token</Btn>} />
        <table>
          <thead><tr><th>Token name</th><th>Scope</th><th>Created</th><th>Last used</th><th></th></tr></thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.name}>
                <td><strong style={{ color: 'var(--text)' }}>{t.name}</strong></td>
                <td><Mono>{t.scope}</Mono></td>
                <td>{t.created}</td>
                <td>{t.last}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Btn style={{ fontSize: 11, minHeight: 28, padding: '2px 8px' }}>Rotate</Btn>
                    <Btn variant="danger" style={{ fontSize: 11, minHeight: 28, padding: '2px 8px' }}>Revoke</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{ marginTop: 18, padding: 18 }}>
        <h2 style={{ margin: '0 0 4px' }}>API reference</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 16px' }}>All endpoints require <code style={{ fontFamily: "'IBM Plex Mono', monospace", background: 'var(--panel-soft)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>Authorization: Bearer &lt;API_TOKEN&gt;</code></p>
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            ['GET', '/api/v1/devices', 'List all devices with filters'],
            ['POST', '/api/v1/devices', 'Create a device'],
            ['GET', '/api/v1/topology', 'Get graph JSON (nodes + edges)'],
            ['POST', '/api/v1/scans/upload', 'Upload a scan file'],
            ['GET', '/api/v1/agents', 'List registered agents'],
            ['POST', '/api/v1/agents/:id/heartbeat', 'Agent heartbeat endpoint'],
          ].map(([method, path, desc]) => (
            <div key={path} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 12, alignItems: 'center', padding: '8px 12px', background: 'var(--panel-strong)', borderRadius: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: method === 'GET' ? 'var(--cyan)' : method === 'POST' ? 'var(--accent)' : 'var(--amber)', fontFamily: "'IBM Plex Mono', monospace" }}>{method}</span>
              <Mono>{path}</Mono>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

export function IntegrationsView() {
  const [tab, setTab] = useState('NetBox')
  return (
    <section className="view-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, letterSpacing: '-.03em' }}>Integrations</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Manage data sources, agents, and API access.</p>
        </div>
      </div>
      <Tabs tabs={['NetBox', 'Agents', 'API access']} active={tab} onChange={setTab} />
      {tab === 'NetBox' && <NetBoxTab />}
      {tab === 'Agents' && <AgentsTab />}
      {tab === 'API access' && <ApiTab />}
    </section>
  )
}
