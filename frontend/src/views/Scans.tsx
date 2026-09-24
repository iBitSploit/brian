import { useState } from 'react'
import { SCANS } from '../data'
import { Card, CardHeader, Btn, Badge, Eyebrow, Mono } from '../components/shared'

const PARSED_PREVIEW = [
  { ip: '10.10.5.44', hostname: 'srv-new-01', type: 'server', ports: '22, 80, 443', os: 'Linux', action: 'new' },
  { ip: '10.10.5.45', hostname: 'srv-new-02', type: 'server', ports: '22, 3306', os: 'Linux', action: 'new' },
  { ip: '10.10.1.10', hostname: 'WEB-01', type: 'server', ports: '22, 80, 443', os: 'Ubuntu 22.04', action: 'update' },
  { ip: '10.10.1.11', hostname: 'WEB-02', type: 'server', ports: '80, 443', os: 'Ubuntu 22.04', action: 'update' },
  { ip: '10.0.0.1', hostname: 'FW-HQ-01', type: 'firewall', ports: '22, 443', os: 'FortiOS', action: 'update' },
]

export function ScansView() {
  const [scanSource, setScanSource] = useState('Nmap XML')
  const [resolution, setResolution] = useState('Merge')
  const [file, setFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [expandedScan, setExpandedScan] = useState<string | null>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); setShowPreview(false) }
  }

  return (
    <section className="view-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, letterSpacing: '-.03em' }}>Scan Uploads</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Import nmap, dnsrecon, Ettercap, and custom JSON scan results.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Upload form */}
        <Card style={{ padding: 18 }}>
          <h2 style={{ margin: '0 0 16px' }}>Upload scan file</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--muted)', fontSize: 12, fontWeight: 500 }}>Scan source</label>
              <select value={scanSource} onChange={e => setScanSource(e.target.value)}>
                {['Nmap XML', 'Dnsrecon JSON', 'Dnsrecon XML', 'Ettercap', 'Custom JSON'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--muted)', fontSize: 12, fontWeight: 500 }}>Conflict resolution</label>
              <select value={resolution} onChange={e => setResolution(e.target.value)}>
                {['Merge', 'Replace', 'Review conflicts'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              padding: '28px 20px', border: `2px dashed ${dragOver ? 'var(--accent)' : file ? 'var(--accent)' : 'var(--border-bright)'}`,
              borderRadius: 10, textAlign: 'center', background: dragOver ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : file ? 'color-mix(in srgb, var(--accent) 4%, transparent)' : 'var(--panel-strong)',
              transition: '.2s', marginBottom: 14,
            }}
          >
            {file ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                <strong style={{ display: 'block', color: 'var(--text)', marginBottom: 4 }}>{file.name}</strong>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>{(file.size / 1024).toFixed(1)} KB · {scanSource}</span>
                <div style={{ marginTop: 12 }}>
                  <Btn variant="ghost" onClick={() => { setFile(null); setShowPreview(false) }} style={{ fontSize: 12 }}>Remove file</Btn>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, margin: '0 auto 12px', border: '1px dashed var(--border-bright)', borderRadius: '50%', color: 'var(--accent)', fontSize: 22 }}>↑</div>
                <strong style={{ color: 'var(--text)' }}>Drop your scan file here</strong>
                <p style={{ color: 'var(--muted)', fontSize: 12, margin: '6px 0 14px' }}>Supported: .xml, .json, .pcap</p>
                <label>
                  <input type="file" accept=".xml,.json,.pcap" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setShowPreview(false) } }} />
                  <Btn>Browse files</Btn>
                </label>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="primary" disabled={!file} onClick={() => setShowPreview(true)}>Preview parsed data</Btn>
            <Btn disabled={!showPreview}>Confirm import</Btn>
          </div>

          {/* Format info */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg)', borderRadius: 6 }}>
            <Eyebrow style={{ display: 'block', marginBottom: 8 }}>Custom JSON format</Eyebrow>
            <pre style={{ margin: 0, fontSize: 10, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.6 }}>{`[{
  "ip": "192.168.1.10",
  "hostname": "server01",
  "device_type": "server",
  "location": "HQ-DC1",
  "services": [{"port": 22, "service": "ssh"}],
  "os": "Linux",
  "scan_date": "2026-09-24T10:30:00Z"
}]`}</pre>
          </div>
        </Card>

        {/* Preview */}
        <div>
          {showPreview ? (
            <Card>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ margin: '0 0 3px' }}>Parsed preview</h2>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>2 new devices · 3 updates · 0 conflicts</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Badge variant="online">2 new</Badge>
                  <Badge variant="info">3 updates</Badge>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>IP</th><th>Hostname</th><th>Type</th><th>Ports</th><th>OS</th><th>Action</th></tr></thead>
                  <tbody>
                    {PARSED_PREVIEW.map((row, i) => (
                      <tr key={i}>
                        <td><Mono>{row.ip}</Mono></td>
                        <td><strong style={{ color: 'var(--text)' }}>{row.hostname}</strong></td>
                        <td>{row.type}</td>
                        <td><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{row.ports}</span></td>
                        <td style={{ fontSize: 12 }}>{row.os}</td>
                        <td>{row.action === 'new' ? <Badge variant="online">New</Badge> : <Badge variant="info">Update</Badge>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <Btn variant="primary">Import {PARSED_PREVIEW.length} devices</Btn>
                <Btn variant="ghost" onClick={() => setShowPreview(false)}>Cancel</Btn>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 18 }}>
              <h2 style={{ margin: '0 0 4px' }}>Import notes</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 16px' }}>Tips for a clean import:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Merge mode', 'Updates existing devices with new port/OS data without overwriting manual edits.'],
                  ['Replace mode', 'Fully overwrites device records where IPs match. Use with caution on production data.'],
                  ['Review conflicts', 'Shows a side-by-side diff for any field that would change before you confirm.'],
                  ['Incremental scans', 'Running nmap with -oX appends new hosts — Brian deduplicates by IP automatically.'],
                ].map(([title, desc]) => (
                  <div key={title as string} style={{ padding: '12px 14px', background: 'var(--panel-strong)', borderRadius: 8 }}>
                    <strong style={{ fontSize: 13 }}>{title as string}</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 12 }}>{desc as string}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* History */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ margin: '0 0 2px' }}>Scan history</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>All imports, validation results, and raw data</p>
          </div>
          <Btn>Export CSV</Btn>
        </div>
        <table>
          <thead><tr><th>File</th><th>Source</th><th>Agent</th><th>New</th><th>Updated</th><th>Duration</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {SCANS.map(scan => (
              <>
                <tr key={scan.id} style={{ background: expandedScan === scan.id ? 'var(--panel-soft)' : undefined }}>
                  <td>
                    <button onClick={() => setExpandedScan(expandedScan === scan.id ? null : scan.id)} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--text)', padding: 0, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, textAlign: 'left' }}>
                      {scan.filename}
                    </button>
                  </td>
                  <td>{scan.source}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{scan.agent ?? '—'}</td>
                  <td><span style={{ color: 'var(--accent)', fontWeight: 700 }}>{scan.devicesDiscovered}</span></td>
                  <td><span style={{ color: 'var(--cyan)' }}>{scan.devicesUpdated}</span></td>
                  <td style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{scan.duration}</td>
                  <td style={{ fontSize: 12 }}>{scan.date}</td>
                  <td>
                    {scan.status === 'success' && <Badge variant="online">Success</Badge>}
                    {scan.status === 'partial' && <Badge variant="warn">Partial</Badge>}
                    {scan.status === 'error' && <Badge variant="error">Error</Badge>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button title="Expand" onClick={() => setExpandedScan(expandedScan === scan.id ? null : scan.id)} style={{ width: 28, height: 28, border: '1px solid var(--border-bright)', borderRadius: 5, background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 }}>{expandedScan === scan.id ? '▾' : '▸'}</button>
                      <button title="Download raw" style={{ width: 28, height: 28, border: '1px solid var(--border-bright)', borderRadius: 5, background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 }}>↓</button>
                    </div>
                  </td>
                </tr>
                {expandedScan === scan.id && (
                  <tr key={`${scan.id}-exp`}>
                    <td colSpan={9} style={{ background: 'var(--panel-soft)', padding: '16px 18px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                        <div>
                          <Eyebrow style={{ display: 'block', marginBottom: 10 }}>Import summary</Eyebrow>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {[['Devices discovered', scan.devicesDiscovered], ['Devices updated', scan.devicesUpdated], ['Conflicts', 0], ['Errors', scan.status === 'error' ? 1 : 0]].map(([k, v]) => (
                              <div key={k as string} style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 6 }}>
                                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{k as string}</div>
                                <strong style={{ color: 'var(--text)' }}>{v as number}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Eyebrow style={{ display: 'block', marginBottom: 10 }}>Actions</Eyebrow>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <Btn>Download raw JSON</Btn>
                            <Btn>View affected devices</Btn>
                            {scan.status !== 'error' && <Btn variant="danger">Undo import</Btn>}
                          </div>
                        </div>
                      </div>
                      {scan.status === 'error' && (
                        <div style={{ marginTop: 14, padding: '12px 14px', background: 'color-mix(in srgb, var(--red) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 25%, transparent)', borderRadius: 6 }}>
                          <strong style={{ color: 'var(--red)', fontSize: 12 }}>Import error</strong>
                          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 12 }}>Unsupported pcap format. Expected Ettercap XML dump or ARP table CSV. Check the file format and re-upload.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  )
}
