import { useState } from 'react'
import { Card, Btn, Badge, SearchInput, Eyebrow } from '../components/shared'

const BUILTIN_ICONS = [
  { id: 'server', label: 'Server', emoji: '🖥', deviceTypes: ['server'] },
  { id: 'router', label: 'Router', emoji: '🔀', deviceTypes: ['router'] },
  { id: 'firewall', label: 'Firewall', emoji: '🛡', deviceTypes: ['firewall'] },
  { id: 'workstation', label: 'Workstation', emoji: '💻', deviceTypes: ['workstation'] },
  { id: 'switch', label: 'Switch', emoji: '🔌', deviceTypes: ['switch'] },
  { id: 'cloud', label: 'Cloud', emoji: '☁', deviceTypes: ['cloud'] },
  { id: 'service', label: 'Service', emoji: '⚙', deviceTypes: ['service'] },
  { id: 'access-point', label: 'Access Point', emoji: '📡', deviceTypes: ['access-point'] },
  { id: 'storage', label: 'Storage', emoji: '🗄', deviceTypes: [] },
  { id: 'database', label: 'Database', emoji: '🗃', deviceTypes: [] },
  { id: 'printer', label: 'Printer', emoji: '🖨', deviceTypes: [] },
  { id: 'iot', label: 'IoT Device', emoji: '💡', deviceTypes: [] },
  { id: 'camera', label: 'IP Camera', emoji: '📷', deviceTypes: [] },
  { id: 'phone', label: 'VoIP Phone', emoji: '📞', deviceTypes: [] },
  { id: 'virtual', label: 'VM / Container', emoji: '📦', deviceTypes: [] },
  { id: 'kubernetes', label: 'Kubernetes', emoji: '⎈', deviceTypes: [] },
]

const CUSTOM_ICONS = [
  { id: 'c1', name: 'Fortinet FW', filename: 'fortinet-fw.svg', size: '4.2 KB', uploaded: '2026-09-10', usedBy: 3 },
  { id: 'c2', name: 'Cisco Router', filename: 'cisco-router.svg', size: '8.1 KB', uploaded: '2026-09-15', usedBy: 7 },
  { id: 'c3', name: 'NetBox Server', filename: 'netbox-srv.png', size: '12.4 KB', uploaded: '2026-09-18', usedBy: 12 },
]

export function IconsView() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [tab, setTab] = useState<'builtin' | 'custom'>('builtin')

  const filtered = BUILTIN_ICONS.filter(i =>
    !search || i.label.toLowerCase().includes(search.toLowerCase()) || i.deviceTypes.some(t => t.includes(search.toLowerCase()))
  )

  return (
    <section className="view-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, letterSpacing: '-.03em' }}>Icon Library</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Map device types to icons. Upload custom SVG or PNG assets.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <label>
            <input type="file" accept=".svg,.png" style={{ display: 'none' }} />
            <Btn variant="primary">↑ Upload icon</Btn>
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {[['builtin', 'Built-in icons'], ['custom', `Custom icons (${CUSTOM_ICONS.length})`]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val as 'builtin' | 'custom')} style={{
            padding: '9px 15px', border: 0, borderBottom: `2px solid ${tab === val ? 'var(--accent)' : 'transparent'}`,
            background: 'transparent', color: tab === val ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: tab === val ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      {tab === 'builtin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <SearchInput placeholder="Search icons or device types…" value={search} onChange={setSearch} style={{ width: 300 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
              {filtered.map(icon => (
                <button key={icon.id} onClick={() => setSelected(selected === icon.id ? null : icon.id)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px',
                  border: `1px solid ${selected === icon.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 10, background: selected === icon.id ? 'color-mix(in srgb, var(--accent) 8%, var(--panel))' : 'var(--panel)',
                  cursor: 'pointer', transition: '.15s ease',
                }}>
                  <span style={{ fontSize: 32 }}>{icon.emoji}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{icon.label}</span>
                  {icon.deviceTypes.length > 0 && (
                    <span style={{ fontSize: 9, color: 'var(--faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>default</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Inspector */}
          <div>
            {selected ? (() => {
              const icon = BUILTIN_ICONS.find(i => i.id === selected)!
              return (
                <Card style={{ padding: 18 }}>
                  <div style={{ textAlign: 'center', padding: '20px 0', marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>{icon.emoji}</div>
                    <strong style={{ fontSize: 16 }}>{icon.label}</strong>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Built-in · System icon</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Eyebrow style={{ display: 'block', marginBottom: 10 }}>Default device types</Eyebrow>
                    {icon.deviceTypes.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {icon.deviceTypes.map(t => (
                          <span key={t} style={{ padding: '4px 9px', background: 'var(--panel-soft)', borderRadius: 4, fontSize: 12, color: 'var(--muted)' }}>{t}</span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>No default assignment</span>
                    )}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Eyebrow style={{ display: 'block', marginBottom: 8 }}>Map to device type</Eyebrow>
                    <select style={{ width: '100%' }}>
                      <option value="">No default (manual assignment only)</option>
                      {['server', 'router', 'firewall', 'workstation', 'switch', 'cloud', 'service', 'access-point'].map(t => (
                        <option key={t} value={t} selected={icon.deviceTypes.includes(t)}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <Btn variant="primary" style={{ width: '100%', justifyContent: 'center' }}>Save assignment</Btn>
                </Card>
              )
            })() : (
              <Card style={{ padding: 18 }}>
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
                  <p style={{ fontSize: 13 }}>Select an icon to configure its device type mapping and preview it.</p>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
                  <Eyebrow style={{ display: 'block', marginBottom: 12 }}>Upload guidelines</Eyebrow>
                  {[['SVG preferred', 'Vector icons scale perfectly at all zoom levels.'], ['Max size', '500 KB per file.'], ['Dimensions', 'Recommend 64×64 or 128×128 px square canvas.'], ['Transparency', 'Transparent background works best in both themes.']].map(([k, v]) => (
                    <div key={k as string} style={{ marginBottom: 8 }}>
                      <strong style={{ fontSize: 12, display: 'block' }}>{k as string}</strong>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{v as string}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'custom' && (
        <div>
          <Card>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: '0 0 2px' }}>Custom icons</h2>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>Uploaded by your organization. Served from the configured icon path.</p>
              </div>
              <Badge>{CUSTOM_ICONS.length} icons</Badge>
            </div>
            <table>
              <thead><tr><th>Preview</th><th>Name</th><th>Filename</th><th>Size</th><th>Uploaded</th><th>Used by</th><th></th></tr></thead>
              <tbody>
                {CUSTOM_ICONS.map(icon => (
                  <tr key={icon.id}>
                    <td>
                      <div style={{ width: 36, height: 36, background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 6, display: 'grid', placeItems: 'center', fontSize: 18 }}>
                        {icon.filename.endsWith('.svg') ? '▤' : '🖼'}
                      </div>
                    </td>
                    <td><strong style={{ color: 'var(--text)' }}>{icon.name}</strong></td>
                    <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{icon.filename}</td>
                    <td>{icon.size}</td>
                    <td>{icon.uploaded}</td>
                    <td><span style={{ color: 'var(--text)', fontWeight: 600 }}>{icon.usedBy}</span> <span style={{ color: 'var(--muted)', fontSize: 12 }}>devices</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Btn style={{ fontSize: 11, minHeight: 28, padding: '2px 10px' }}>Map to type</Btn>
                        <button style={{ width: 28, height: 28, border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', borderRadius: 5, background: 'var(--panel)', color: 'var(--red)', cursor: 'pointer', fontSize: 13 }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card style={{ marginTop: 18, padding: 18 }}>
            <h2 style={{ margin: '0 0 4px' }}>Icon path configuration</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px' }}>Brian reads custom icons from a configurable directory. Change this path to point at an external volume or NFS share.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input defaultValue="/var/brian/icons/" style={{ flex: 1, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }} />
              <Btn>Save path</Btn>
              <Btn>Reload icons</Btn>
            </div>
          </Card>
        </div>
      )}
    </section>
  )
}
