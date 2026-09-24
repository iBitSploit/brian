import { ACTIVITY, DEVICES, AGENTS, SCANS } from '../data'
import { Card, Btn, Badge, StatusDot, ViewHeading, SectionTitle, Eyebrow } from '../components/shared'
import type { View } from '../App'

function Metric({ label, value, note, color }: { label: string; value: string | number; note: string; color?: string }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--panel)', boxShadow: 'var(--shadow)', padding: 18 }}>
      <Eyebrow>{label}</Eyebrow>
      <strong style={{ display: 'block', margin: '10px 0 3px', fontSize: 30, fontWeight: 700, letterSpacing: '-.05em', color: color ?? 'var(--text)' }}>{value}</strong>
      <span style={{ color: 'var(--muted)', fontSize: 12 }}>{note}</span>
    </div>
  )
}

const TYPE_COLORS: Record<string, string> = {
  sync: 'var(--accent)', scan: 'var(--cyan)', device: 'var(--amber)', agent: 'var(--accent)', alert: 'var(--red)',
}

export function DashboardView({ navigate }: { navigate: (v: View) => void }) {
  const onlineDevices = DEVICES.filter(d => d.status === 'online').length
  const offlineDevices = DEVICES.filter(d => d.status === 'offline').length
  const unknownDevices = DEVICES.filter(d => d.status === 'unknown').length
  const onlineAgents = AGENTS.filter(a => a.status === 'online').length
  const lastScan = SCANS[0]

  // Breakdown by location
  const locations = [...new Set(DEVICES.map(d => d.location))]
  const locationCounts = locations.map(loc => ({
    name: loc,
    count: DEVICES.filter(d => d.location === loc).length,
    online: DEVICES.filter(d => d.location === loc && d.status === 'online').length,
  }))

  // Source breakdown
  const sources = [
    { label: 'NetBox', count: DEVICES.filter(d => d.scanSource === 'NetBox').length, color: 'var(--accent)' },
    { label: 'Agents', count: DEVICES.filter(d => d.scanSource.startsWith('Agent')).length, color: 'var(--cyan)' },
    { label: 'Nmap', count: DEVICES.filter(d => d.scanSource === 'Nmap').length, color: 'var(--amber)' },
    { label: 'Manual', count: DEVICES.filter(d => d.scanSource === 'Manual').length, color: 'var(--muted)' },
    { label: 'Dnsrecon', count: DEVICES.filter(d => d.scanSource === 'Dnsrecon').length, color: 'var(--cyan)' },
  ]

  return (
    <section className="view-enter">
      <ViewHeading
        left={<><SectionTitle>Dashboard</SectionTitle><p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Overview of your network topology and discovery activity.</p></>}
        right={<><Btn onClick={() => navigate('integrations')}>Connect source</Btn><Btn variant="primary" onClick={() => navigate('topology')}>Open topology</Btn></>}
      />

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <Metric label="Total devices" value={DEVICES.length} note={`${onlineDevices} online · ${offlineDevices} offline · ${unknownDevices} unknown`} color="var(--text)" />
        <Metric label="Connections" value="31" note="Across 3 sites and AWS" />
        <Metric label="Active agents" value={`${onlineAgents}/${AGENTS.length}`} note="1 degraded · 0 offline" color={onlineAgents < AGENTS.length ? 'var(--amber)' : undefined} />
        <Metric label="Last discovery" value="8 min" note={`${lastScan.filename} · ${lastScan.devicesDiscovered} new hosts`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Activity feed */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <div><h2 style={{ margin: '0 0 2px' }}>Recent activity</h2><p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>Syncs, imports, and topology changes</p></div>
            <Btn variant="ghost" onClick={() => navigate('scans')}>View scans →</Btn>
          </div>
          <div>
            {ACTIVITY.map((a, i) => (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '8px 1fr auto', gap: 14, alignItems: 'start', padding: '13px 18px', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[a.type] ?? 'var(--muted)', marginTop: 5, boxShadow: `0 0 0 3px color-mix(in srgb, ${TYPE_COLORS[a.type] ?? 'var(--muted)'} 15%, transparent)`, flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: 13, color: 'var(--text)' }}>{a.message}</strong>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{a.detail}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--faint)', whiteSpace: 'nowrap', marginTop: 2 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Status summary */}
          <Card style={{ padding: 18 }}>
            <h2 style={{ margin: '0 0 14px' }}>Device status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Online', count: onlineDevices, total: DEVICES.length, color: 'var(--accent)' },
                { label: 'Offline', count: offlineDevices, total: DEVICES.length, color: 'var(--red)' },
                { label: 'Unknown', count: unknownDevices, total: DEVICES.length, color: 'var(--amber)' },
              ].map(({ label, count, total, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                    <span style={{ color: 'var(--muted)' }}>{label}</span>
                    <strong style={{ color }}>{count}</strong>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--border-bright)' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: color, width: `${(count / total) * 100}%`, transition: '.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 10px', fontSize: 13 }}>By location</h2>
              {locationCounts.map(({ name, count, online }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text)' }}>{name}</span>
                  <span style={{ color: 'var(--muted)' }}>{online}/{count} online</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Agent health */}
          <Card style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>Agent health</h2>
              <Btn variant="ghost" onClick={() => navigate('agents')} style={{ fontSize: 12, padding: '4px 8px', minHeight: 28 }}>Manage →</Btn>
            </div>
            {AGENTS.map(agent => (
              <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <StatusDot status={agent.status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{agent.location} · {agent.lastHeartbeat}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{agent.devicesFound} dev</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Data sources + recent scans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 18 }}>
        <Card style={{ padding: 18 }}>
          <h2 style={{ margin: '0 0 16px' }}>Inventory sources</h2>
          {sources.filter(s => s.count > 0).map(({ label, count, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{label}</span>
              <strong style={{ fontSize: 13, color: 'var(--muted)' }}>{count}</strong>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Badge variant="online">NetBox connected</Badge>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ margin: 0 }}>Recent scans</h2>
            <Btn variant="ghost" onClick={() => navigate('scans')} style={{ fontSize: 12, padding: '4px 8px', minHeight: 28 }}>View all →</Btn>
          </div>
          <table>
            <thead><tr><th>File</th><th>Source</th><th>Found</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {SCANS.slice(0, 4).map(scan => (
                <tr key={scan.id}>
                  <td><strong style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{scan.filename}</strong></td>
                  <td>{scan.source}</td>
                  <td>{scan.devicesDiscovered + scan.devicesUpdated}</td>
                  <td style={{ fontSize: 11 }}>{scan.date.split(' ')[0]}</td>
                  <td>
                    {scan.status === 'success' && <Badge variant="online">OK</Badge>}
                    {scan.status === 'partial' && <Badge variant="warn">Partial</Badge>}
                    {scan.status === 'error' && <Badge variant="error">Error</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  )
}
