import { useState } from 'react'
import { Card, Btn, Tabs, Eyebrow, Mono } from '../components/shared'
import type { View } from '../App'

const GUIDES = [
  { num: '01', section: 'Getting started', title: 'First topology', body: 'Connect NetBox or add a device manually, then open the topology canvas to arrange and inspect relationships.', action: 'Open topology' as View },
  { num: '02', section: 'Discovery', title: 'Scan ingestion', body: 'Upload nmap, dnsrecon, Ettercap, or custom JSON output. Review the parsed device table before confirming the import.' },
  { num: '03', section: 'Operations', title: 'Distributed agents', body: 'Register an outbound-only lightweight agent for remote subnets. Heartbeat status and scan provenance are visible centrally.' },
  { num: '04', section: 'Security', title: 'API tokens & access', body: 'Use scoped bearer tokens for automation, scripts, and agents. Keep traffic behind HTTPS and rotate tokens regularly.' },
  { num: '05', section: 'Visualization', title: 'State semantics', body: 'Operational state is communicated through color, borders, icons, labels, and opacity — never color alone.' },
  { num: '06', section: 'Export & reporting', title: 'Evidence & reports', body: 'Export filtered inventory as CSV or JSON. Render the current topology view as SVG or PNG for documentation.' },
]

const FAQ = [
  { q: 'How do I connect NetBox?', a: 'Go to Integrations → NetBox tab. Enter your NetBox base URL and an API token with read-only permissions. Click "Test connection" to validate, then "Save configuration".' },
  { q: 'What scan formats does Brian support?', a: 'Brian accepts nmap XML (-oX), dnsrecon JSON and XML, Ettercap ARP dumps, and a generic JSON array format documented in the Scan uploads view.' },
  { q: 'How do agents authenticate?', a: 'Agents use Bearer token authentication. Generate a token in Integrations → API access or when registering an agent. Set it as the AGENT_TOKEN environment variable.' },
  { q: 'Can I manually edit device positions on the topology canvas?', a: 'Yes. Drag any node to position it manually. Manual positions take precedence over automatic layouts until you explicitly trigger a new layout from the toolbar.' },
  { q: 'What does "degraded" agent status mean?', a: 'An agent is degraded when its last heartbeat was between 5 minutes and 1 hour ago. After 1 hour without a heartbeat, the agent moves to "offline".' },
  { q: 'How does conflict resolution work during NetBox sync?', a: '"Manual merge" queues conflicts for your review. "Timestamp wins" keeps the most recently updated record. "NetBox preference" always overwrites Brian with NetBox data.' },
  { q: 'How do I bulk import devices?', a: 'Go to Devices → Bulk import CSV. The CSV must contain columns: ip, name, device_type, location. MAC address, OS, tags, and description are optional.' },
  { q: 'Is there an Undo for scan imports?', a: 'Yes — within 10 minutes of a successful import you can click "Undo import" in Scan uploads → history to revert all device changes from that import.' },
]

const CHANGELOG = [
  { version: 'v0.9.1-alpha', date: '2026-09-20', changes: ['Added degraded agent status threshold (1 h heartbeat window)', 'Improved NetBox device type → icon mapping UI', 'Fixed topology node drag on touch devices', 'Added "Undo import" button (10-minute window)'] },
  { version: 'v0.9.0-alpha', date: '2026-09-01', changes: ['Dnsrecon JSON/XML ingestion', 'Bulk CSV device import', 'Saved filter views in device inventory', 'Dark/light theme persistence'] },
  { version: 'v0.8.0-alpha', date: '2026-08-12', changes: ['Distributed agent architecture (registration, heartbeat, scan reporting)', 'Agent management UI with expandable rows', 'Docker Compose single-command deployment'] },
  { version: 'v0.7.0-alpha', date: '2026-07-28', changes: ['NetBox read-only sync', 'Conflict resolution (manual merge, timestamp, NetBox preference)', 'Custom icon upload and path configuration'] },
]

export function HelpView({ navigate }: { navigate: (v: View) => void }) {
  const [tab, setTab] = useState('Guides')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className="view-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, letterSpacing: '-.03em' }}>Documentation</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Guides, FAQ, API reference, and changelog.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn>Open API reference</Btn>
          <a href="https://github.com/yourusername/brian" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <Btn>GitHub ↗</Btn>
          </a>
        </div>
      </div>

      <Tabs tabs={['Guides', 'FAQ', 'Quick start', 'Changelog']} active={tab} onChange={setTab} />

      {tab === 'Guides' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
            {GUIDES.map(({ num, section, title, body, action }) => (
              <Card key={num} style={{ padding: 18 }}>
                <Eyebrow>{num} / {section}</Eyebrow>
                <h2 style={{ margin: '10px 0 8px' }}>{title}</h2>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: action ? 16 : 0 }}>{body}</p>
                {action && <Btn onClick={() => navigate(action as View)} style={{ fontSize: 12 }}>Open →</Btn>}
              </Card>
            ))}
          </div>

          <Card style={{ padding: 18 }}>
            <h2 style={{ margin: '0 0 4px' }}>Topology presentation principles</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px' }}>Brian's canvas follows these design rules for clarity at scale.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Topology-first', 'Network relationships take visual precedence over decorative UI elements.'],
                ['Progressive disclosure', 'Secondary metadata appears on zoom, hover, selection, or in detail panels — never all at once.'],
                ['State without color alone', 'Online/offline/unknown is always communicated through icon, border, opacity, or label in addition to color.'],
                ['Manual positioning', 'Drag positions persist and override automatic layout until the user requests a new layout.'],
                ['Source provenance', 'Every device record retains which agent, tool, or integration discovered it.'],
                ['Level-of-detail rendering', 'Labels, interface names, and metadata progressively simplify as you zoom out.'],
              ].map(([title, desc]) => (
                <div key={title} style={{ padding: '14px 16px', background: 'var(--panel-strong)', borderRadius: 8 }}>
                  <strong style={{ display: 'block', fontSize: 13, marginBottom: 5 }}>{title}</strong>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'FAQ' && (
        <Card>
          {FAQ.map((item, i) => (
            <div key={i} style={{ borderBottom: i < FAQ.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, width: '100%', padding: '16px 18px', border: 0, background: openFaq === i ? 'var(--panel-soft)' : 'transparent', color: 'var(--text)', cursor: 'pointer', textAlign: 'left' }}
              >
                <strong style={{ fontSize: 14 }}>{item.q}</strong>
                <span style={{ color: 'var(--muted)', flexShrink: 0 }}>{openFaq === i ? '▾' : '▸'}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 18px 16px', color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>{item.a}</div>
              )}
            </div>
          ))}
        </Card>
      )}

      {tab === 'Quick start' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card style={{ padding: 18 }}>
            <h2 style={{ margin: '0 0 4px' }}>Docker Compose deployment</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px' }}>Recommended for single-server MVP deployments. Runs the frontend, API, PostgreSQL, and Redis.</p>
            <pre style={{ margin: 0, padding: '14px 16px', background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--accent)', fontFamily: "'IBM Plex Mono', monospace", overflowX: 'auto', lineHeight: 1.7 }}>{`git clone https://github.com/yourusername/brian.git
cd brian
cp .env.example .env
# Edit .env: DATABASE_URL, REDIS_URL, etc.
docker-compose up -d
# Access at http://localhost:3000`}</pre>
          </Card>

          <Card style={{ padding: 18 }}>
            <h2 style={{ margin: '0 0 4px' }}>Agent deployment</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px' }}>Deploy one agent per subnet or location. The agent initiates outbound connections — no inbound ports required.</p>
            <pre style={{ margin: 0, padding: '14px 16px', background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--accent)', fontFamily: "'IBM Plex Mono', monospace", overflowX: 'auto', lineHeight: 1.7 }}>{`# 1. Register the agent in Brian (Integrations → Agents)
# 2. Copy the generated API token
# 3. Run:
docker run -d \\
  -e NETVIZ_SERVER=https://brian.internal.corp \\
  -e AGENT_TOKEN=brn_yourtokenhere \\
  -e AGENT_NAME="DC1-Scanner" \\
  -e SCAN_TARGETS="10.0.0.0/24,10.0.1.0/24" \\
  -e SCAN_SCHEDULE="0 */6 * * *" \\
  brian-agent:latest`}</pre>
          </Card>

          <Card style={{ padding: 18 }}>
            <h2 style={{ margin: '0 0 4px' }}>nmap scan integration</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px' }}>Run nmap and upload the XML output to Brian for automatic host creation.</p>
            <pre style={{ margin: 0, padding: '14px 16px', background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--cyan)', fontFamily: "'IBM Plex Mono', monospace", overflowX: 'auto', lineHeight: 1.7 }}>{`# Service and OS detection scan
nmap -sV -O -oX scan_results.xml 192.168.0.0/24

# Then upload scan_results.xml via:
# Brian UI → Scan uploads → Upload scan file
# OR via API:
curl -X POST https://brian.corp/api/v1/scans/upload \\
  -H "Authorization: Bearer \$TOKEN" \\
  -F "file=@scan_results.xml" \\
  -F "source=nmap" \\
  -F "conflict=merge"`}</pre>
          </Card>

          <Card style={{ padding: 18 }}>
            <h2 style={{ margin: '0 0 4px' }}>Systemd service (bare metal)</h2>
            <pre style={{ margin: 0, padding: '14px 16px', background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", overflowX: 'auto', lineHeight: 1.7 }}>{`[Unit]
Description=Brian Network Topology Agent
After=network.target

[Service]
Environment=NETVIZ_SERVER=https://brian.corp
Environment=AGENT_TOKEN=brn_yourtoken
Environment=SCAN_TARGETS=10.0.0.0/24
ExecStart=/usr/local/bin/brian-agent
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`}</pre>
          </Card>
        </div>
      )}

      {tab === 'Changelog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {CHANGELOG.map(({ version, date, changes }) => (
            <Card key={version} style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{version}</span>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>{date}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {changes.map((c, i) => (
                  <li key={i} style={{ color: 'var(--text)', fontSize: 13 }}>{c}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
