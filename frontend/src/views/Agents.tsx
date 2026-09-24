import { useState } from 'react'
import { AGENTS, type Agent } from '../data'
import { Card, CardHeader, Btn, Badge, StatusDot, Modal, Field, Eyebrow, Mono } from '../components/shared'

function AgentRow({ agent, onExpand, expanded }: { agent: Agent; expanded: boolean; onExpand: () => void }) {
  const statusColor = { online: 'var(--accent)', offline: 'var(--red)', degraded: 'var(--amber)' }[agent.status]
  return (
    <>
      <tr style={{ background: expanded ? 'var(--panel-soft)' : undefined }}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusDot status={agent.status} />
            <strong style={{ color: 'var(--text)' }}>{agent.name}</strong>
          </div>
        </td>
        <td>{agent.location}</td>
        <td><Mono>{agent.ip}</Mono></td>
        <td>{agent.os}</td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ textTransform: 'capitalize', fontSize: 12, color: statusColor }}>{agent.status}</span>
          </div>
        </td>
        <td style={{ fontSize: 12 }}>{agent.lastHeartbeat}</td>
        <td style={{ fontSize: 12 }}>{agent.lastScan.split(' ')[0]}</td>
        <td>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{agent.devicesFound}</span>
          <span style={{ color: 'var(--muted)', fontSize: 11 }}> devices</span>
        </td>
        <td><Mono>{agent.scanTargets}</Mono></td>
        <td>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={onExpand} title="Expand" style={{ width: 28, height: 28, border: '1px solid var(--border-bright)', borderRadius: 5, background: expanded ? 'var(--panel-soft)' : 'var(--panel)', color: expanded ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>{expanded ? '▾' : '▸'}</button>
            <button title="Trigger scan" style={{ width: 28, height: 28, border: '1px solid var(--border-bright)', borderRadius: 5, background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>▶</button>
            <button title="Refresh" style={{ width: 28, height: 28, border: '1px solid var(--border-bright)', borderRadius: 5, background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>⟳</button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr key={`${agent.id}-exp`}>
          <td colSpan={10} style={{ background: 'var(--panel-soft)', padding: '0 0 0 0', border: 'none' }}>
            <div style={{ padding: '20px 18px', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 24 }}>
              {/* Config */}
              <div>
                <Eyebrow style={{ display: 'block', marginBottom: 12 }}>Configuration</Eyebrow>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Field label="Scan schedule (cron)">
                    <input defaultValue={agent.scanSchedule} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} />
                  </Field>
                  <Field label="Scan targets">
                    <textarea defaultValue={agent.scanTargets} rows={2} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, resize: 'vertical' }} />
                  </Field>
                  <Field label="Scan type">
                    <select defaultValue="network"><option>Network subnet</option><option>Specific hosts</option><option>Service probing</option></select>
                  </Field>
                  <Btn>Save configuration</Btn>
                </div>
              </div>

              {/* Deployment */}
              <div>
                <Eyebrow style={{ display: 'block', marginBottom: 12 }}>Deployment</Eyebrow>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>API token</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--accent)' }}>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.token}</span>
                    <button style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 11, flexShrink: 0 }}>Copy</button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>Docker run command</div>
                  <pre style={{ margin: 0, padding: '10px 12px', background: 'var(--bg)', borderRadius: 6, fontSize: 10, color: 'var(--muted)', overflowX: 'auto', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.7 }}>{`docker run -d \\
  -e NETVIZ_SERVER=https://brian \\
  -e AGENT_TOKEN=${agent.token} \\
  -e AGENT_NAME="${agent.name}" \\
  -e SCAN_TARGETS="${agent.scanTargets}" \\
  brian-agent:latest`}</pre>
                </div>
              </div>

              {/* Status & actions */}
              <div>
                <Eyebrow style={{ display: 'block', marginBottom: 12 }}>Status & actions</Eyebrow>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {[
                    ['Status', <span style={{ textTransform: 'capitalize', color: { online: 'var(--accent)', offline: 'var(--red)', degraded: 'var(--amber)' }[agent.status] }}>{agent.status}</span>],
                    ['Last heartbeat', agent.lastHeartbeat],
                    ['Last scan', agent.lastScan.split(' ')[0]],
                    ['Devices found', agent.devicesFound],
                  ].map(([k, v]) => (
                    <div key={k as string}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{k as string}</div>
                      <div style={{ fontSize: 13, color: 'var(--text)' }}>{v as React.ReactNode}</div>
                    </div>
                  ))}
                </div>

                {/* Fake heartbeat log */}
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Recent heartbeats</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {['34 s ago', '5 min 34 s ago', '10 min 34 s ago', '15 min 34 s ago'].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--muted)' }}>{t}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Btn style={{ width: '100%', justifyContent: 'center' }}>▶ Trigger scan now</Btn>
                  <Btn style={{ width: '100%', justifyContent: 'center' }}>View full logs</Btn>
                  <Btn variant="danger" style={{ width: '100%', justifyContent: 'center' }}>Decommission</Btn>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function AgentsView() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [locationFilter, setLocationFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = AGENTS.filter(a =>
    (locationFilter === 'All' || a.location === locationFilter) &&
    (statusFilter === 'All' || a.status === statusFilter)
  )
  const locations = ['All', ...new Set(AGENTS.map(a => a.location))]

  const onlineCount = AGENTS.filter(a => a.status === 'online').length
  const degradedCount = AGENTS.filter(a => a.status === 'degraded').length
  const offlineCount = AGENTS.filter(a => a.status === 'offline').length

  return (
    <section className="view-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, letterSpacing: '-.03em' }}>Distributed Agents</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Heartbeat thresholds: online &lt;5 min · degraded &lt;1 h · offline after 1 h</p>
        </div>
        <Btn variant="primary" onClick={() => setShowRegister(true)}>＋ Register agent</Btn>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Online', count: onlineCount, color: 'var(--accent)', filter: 'online' },
          { label: 'Degraded', count: degradedCount, color: 'var(--amber)', filter: 'degraded' },
          { label: 'Offline', count: offlineCount, color: 'var(--red)', filter: 'offline' },
        ].map(({ label, count, color, filter }) => (
          <button key={label} onClick={() => setStatusFilter(statusFilter === filter ? 'All' : filter)} style={{
            border: `1px solid ${statusFilter === filter ? color : 'var(--border)'}`, borderRadius: 'var(--radius)',
            background: statusFilter === filter ? `color-mix(in srgb, ${color} 8%, var(--panel))` : 'var(--panel)',
            boxShadow: 'var(--shadow)', padding: '16px 18px', textAlign: 'left', cursor: 'pointer',
          }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.04em', color }}>{count}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} style={{ padding: '7px 10px' }}>
          {locations.map(l => <option key={l}>{l}</option>)}
        </select>
        {(locationFilter !== 'All' || statusFilter !== 'All') && (
          <Btn variant="ghost" onClick={() => { setLocationFilter('All'); setStatusFilter('All') }}>Clear filters</Btn>
        )}
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Agent</th><th>Location</th><th>IP</th><th>OS</th><th>Status</th><th>Last heartbeat</th><th>Last scan</th><th>Devices</th><th>Targets</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(agent => (
                <AgentRow
                  key={agent.id}
                  agent={agent}
                  expanded={expandedId === agent.id}
                  onExpand={() => setExpandedId(expandedId === agent.id ? null : agent.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showRegister && (
        <Modal title="Register new agent" onClose={() => setShowRegister(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Agent name"><input placeholder="e.g. DC3-Scanner" /></Field>
            <Field label="Location">
              <select defaultValue=""><option value="" disabled>Choose location</option>{locations.filter(l => l !== 'All').map(l => <option key={l}>{l}</option>)}</select>
            </Field>
            <Field label="Scan targets"><input placeholder="10.0.0.0/24, 10.0.1.0/24" /></Field>
            <Field label="Scan schedule">
              <select defaultValue="0 */6 * * *"><option>0 */1 * * * (hourly)</option><option>0 */6 * * * (every 6h)</option><option>0 0 * * * (daily)</option></select>
            </Field>
            <Field label="Scan type" style={{ gridColumn: '1 / -1' }}>
              <select><option>Network subnet</option><option>Specific hosts</option><option>Service probing</option></select>
            </Field>
            <div style={{ gridColumn: '1 / -1', padding: '12px 14px', background: 'var(--bg)', borderRadius: 6 }}>
              <Eyebrow style={{ display: 'block', marginBottom: 8 }}>Auto-generated token</Eyebrow>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                brn_new_4x8k2p9qmr7j
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
    </section>
  )
}
