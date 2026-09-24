import { useState, useRef, useCallback } from 'react'
import { TOPO_NODES, TOPO_EDGES, DEVICES, type TopoNode } from '../data'
import { Card, Btn, Badge, StatusBadge, DeviceTypeIcon, Eyebrow, Mono } from '../components/shared'
import type { View } from '../App'

const STATUS_COLOR: Record<string, string> = {
  online: 'var(--accent)', offline: 'var(--red)', unknown: 'var(--amber)',
}
const TYPE_GLYPH: Record<string, string> = {
  server: '▪', router: '◆', firewall: '▲', workstation: '◉', switch: '⬡', cloud: '☁', service: '⚙', 'access-point': '◎',
}

function NodeShape({ node, selected }: { node: TopoNode; selected: boolean }) {
  const color = STATUS_COLOR[node.status] ?? 'var(--muted)'
  const isCloud = node.type === 'cloud'
  const r = isCloud ? 22 : 20

  return (
    <g>
      {selected && <circle cx={0} cy={0} r={r + 8} fill={`color-mix(in srgb, ${color} 15%, transparent)`} />}
      <circle cx={0} cy={0} r={r} fill="var(--panel-strong)" stroke={selected ? color : 'var(--border-bright)'} strokeWidth={selected ? 2 : 1.5} />
      <circle cx={0} cy={0} r={r - 4} fill={`color-mix(in srgb, ${color} 8%, transparent)`} />
      <text textAnchor="middle" dominantBaseline="central" fontSize={12} fill={color} fontWeight={600} style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {TYPE_GLYPH[node.type] ?? '●'}
      </text>
      {node.status === 'online' && (
        <circle cx={r - 4} cy={-(r - 4)} r={4} fill={color} stroke="var(--panel-strong)" strokeWidth={1.5} />
      )}
      {node.status === 'offline' && (
        <circle cx={r - 4} cy={-(r - 4)} r={4} fill="var(--red)" stroke="var(--panel-strong)" strokeWidth={1.5} />
      )}
      {node.status === 'unknown' && (
        <circle cx={r - 4} cy={-(r - 4)} r={4} fill="var(--amber)" stroke="var(--panel-strong)" strokeWidth={1.5} />
      )}
    </g>
  )
}

function EdgePath({ source, target, type }: { source: TopoNode; target: TopoNode; type: 'direct' | 'inferred' | 'dns' }) {
  const dx = target.x - source.x
  const dy = target.y - source.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / len
  const uy = dy / len
  const sx = source.x + ux * 22
  const sy = source.y + uy * 22
  const ex = target.x - ux * 22
  const ey = target.y - uy * 22
  const color = type === 'direct' ? 'var(--border-bright)' : 'var(--amber)'

  return (
    <line
      x1={sx} y1={sy} x2={ex} y2={ey}
      stroke={color} strokeWidth={type === 'direct' ? 1.5 : 1}
      strokeDasharray={type === 'inferred' ? '5 4' : undefined}
      opacity={0.7}
    />
  )
}

export function TopologyView({ navigate }: { navigate: (v: View) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [layout, setLayout] = useState('Hierarchical')
  const [group, setGroup] = useState('None')
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })

  const selectedNode = TOPO_NODES.find(n => n.id === selectedId) ?? null
  const selectedDevice = selectedNode ? DEVICES.find(d => d.ip === selectedNode.ip) : null

  const filteredNodes = filterStatus.length === 0
    ? TOPO_NODES
    : TOPO_NODES.filter(n => filterStatus.includes(n.status))

  const filteredEdges = TOPO_EDGES.filter(e =>
    filteredNodes.find(n => n.id === e.source) && filteredNodes.find(n => n.id === e.target)
  )

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest('[data-node]')) return
    isPanning.current = true
    lastPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return
    setPan({ x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.current.y })
  }, [])

  const handleMouseUp = useCallback(() => { isPanning.current = false }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(z => Math.max(0.3, Math.min(2.5, z - e.deltaY * 0.001)))
  }, [])

  function resetView() { setZoom(1); setPan({ x: 0, y: 0 }) }

  const statusCounts = {
    online: TOPO_NODES.filter(n => n.status === 'online').length,
    offline: TOPO_NODES.filter(n => n.status === 'offline').length,
    unknown: TOPO_NODES.filter(n => n.status === 'unknown').length,
  }

  function toggleFilter(s: string) {
    setFilterStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  return (
    <section className="view-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, letterSpacing: '-.03em' }}>Network Topology</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>{TOPO_NODES.length} nodes · {TOPO_EDGES.length} connections · Last updated 8 min ago</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn>Export SVG</Btn>
          <Btn>Export PNG</Btn>
          <Btn variant="primary" onClick={() => navigate('devices')}>＋ Add node</Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,1fr) 280px', minHeight: 680, border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--panel)', boxShadow: 'var(--shadow)' }}>
        {/* Left panel */}
        <aside style={{ padding: 16, background: 'var(--panel-strong)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto' }}>
          <Eyebrow>View controls</Eyebrow>

          <div style={{ marginTop: 14, marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 5, color: 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Layout</label>
            <select value={layout} onChange={e => setLayout(e.target.value)} style={{ width: '100%' }}>
              {['Hierarchical', 'Force-directed', 'Radial', 'Breadth-first'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 5, color: 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Group by</label>
            <select value={group} onChange={e => setGroup(e.target.value)} style={{ width: '100%' }}>
              {['None', 'Site', 'Network', 'Device type', 'Function'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {[['Show grid', showGrid, setShowGrid], ['Show labels', showLabels, setShowLabels]].map(([label, val, set]) => (
            <label key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={val as boolean} onChange={e => (set as (v: boolean) => void)(e.target.checked)} style={{ width: 'auto', accentColor: 'var(--accent)' }} />
              {label as string}
            </label>
          ))}

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <Eyebrow>Status filter</Eyebrow>
            <div style={{ marginTop: 10, display: 'grid', gap: 2 }}>
              {[['online', 'var(--accent)', statusCounts.online], ['offline', 'var(--red)', statusCounts.offline], ['unknown', 'var(--amber)', statusCounts.unknown]].map(([s, color, count]) => (
                <label key={s as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, background: filterStatus.includes(s as string) ? 'var(--panel-soft)' : 'transparent', cursor: 'pointer', fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)' }}>
                    <input type="checkbox" checked={filterStatus.includes(s as string)} onChange={() => toggleFilter(s as string)} style={{ width: 'auto', accentColor: color as string }} />
                    <span style={{ textTransform: 'capitalize' }}>{s as string}</span>
                  </span>
                  <span style={{ color: color as string, fontWeight: 700 }}>{count as number}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <Eyebrow>Legend</Eyebrow>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
                <span style={{ width: 18, height: 2, background: 'var(--border-bright)', display: 'inline-block', flexShrink: 0 }} />Direct link
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
                <span style={{ width: 18, height: 2, display: 'inline-block', flexShrink: 0, background: 'repeating-linear-gradient(90deg, var(--amber) 0 5px, transparent 5px 8px)' }} />Inferred
              </div>
              {[['●', 'var(--accent)', 'Online'], ['●', 'var(--red)', 'Offline'], ['●', 'var(--amber)', 'Unknown']].map(([g, c, l]) => (
                <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
                  <span style={{ color: c as string, fontSize: 10 }}>{g as string}</span>{l as string}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div
          style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg)', cursor: 'grab', userSelect: 'none', backgroundImage: showGrid ? 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)' : 'none', backgroundSize: '28px 28px' }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={e => { if ((e.target as SVGElement).tagName === 'svg' || (e.target as SVGElement).tagName === 'rect') setSelectedId(null) }}
        >
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'absolute', zIndex: 2, top: 12, left: 12, right: 12, pointerEvents: 'none' }}>
            <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
              <div style={{ display: 'flex', gap: 4, padding: 4, border: '1px solid var(--border)', borderRadius: 7, background: 'color-mix(in srgb, var(--panel) 92%, transparent)' }}>
                {[['−', () => setZoom(z => Math.max(0.3, z - 0.15))], ['＋', () => setZoom(z => Math.min(2.5, z + 0.15))], ['⌗', resetView], ['↻', resetView]].map(([icon, fn]) => (
                  <button key={icon as string} onClick={fn as () => void} style={{ width: 30, height: 28, border: 0, borderRadius: 4, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>{icon as string}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'color-mix(in srgb, var(--panel) 92%, transparent)', fontSize: 11, color: 'var(--muted)', pointerEvents: 'auto' }}>
              {Math.round(zoom * 100)}%
            </div>
          </div>

          <svg
            style={{ width: '100%', height: '100%', minHeight: 680 }}
          >
            <g transform={`translate(${pan.x + 60}, ${pan.y + 30}) scale(${zoom})`}>
              {/* Edges */}
              {filteredEdges.map(edge => {
                const s = filteredNodes.find(n => n.id === edge.source)
                const t = filteredNodes.find(n => n.id === edge.target)
                if (!s || !t) return null
                return <EdgePath key={edge.id} source={s} target={t} type={edge.type} />
              })}
              {/* Nodes */}
              {filteredNodes.map(node => (
                <g
                  key={node.id}
                  data-node="1"
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); setSelectedId(node.id === selectedId ? null : node.id) }}
                >
                  <NodeShape node={node} selected={node.id === selectedId} />
                  {showLabels && (
                    <text
                      y={28} textAnchor="middle"
                      fontSize={10} fill="var(--text)" fontWeight={500}
                      style={{ fontFamily: "'IBM Plex Sans', sans-serif", pointerEvents: 'none' }}
                    >
                      {node.label}
                    </text>
                  )}
                  {showLabels && (
                    <text
                      y={40} textAnchor="middle"
                      fontSize={9} fill="var(--faint)"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", pointerEvents: 'none' }}
                    >
                      {node.ip}
                    </text>
                  )}
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Inspector */}
        <aside style={{ padding: 18, background: 'var(--panel-strong)', borderLeft: '1px solid var(--border)', overflowY: 'auto' }}>
          {!selectedNode ? (
            <>
              <Eyebrow>Inspector</Eyebrow>
              <div style={{ marginTop: 24, textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, margin: '0 auto 12px', border: '1px dashed var(--border-bright)', borderRadius: '50%', color: 'var(--faint)', fontSize: 18 }}>◇</div>
                <p style={{ fontSize: 12 }}>Click a node to inspect its details and connected assets.</p>
              </div>
              {/* Summary stats */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <Eyebrow>Graph summary</Eyebrow>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[['Nodes', TOPO_NODES.length], ['Edges', TOPO_EDGES.length], ['Direct links', TOPO_EDGES.filter(e => e.type === 'direct').length], ['Inferred links', TOPO_EDGES.filter(e => e.type === 'inferred').length]].map(([k, v]) => (
                    <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>{k as string}</span>
                      <strong style={{ color: 'var(--text)' }}>{v as number}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Eyebrow>Inspector</Eyebrow>
                <button onClick={() => setSelectedId(null)} style={{ width: 24, height: 24, border: 0, borderRadius: 5, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>✕</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <DeviceTypeIcon type={selectedNode.type} size={24} />
                <div>
                  <strong style={{ display: 'block', fontSize: 14 }}>{selectedNode.label}</strong>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>{selectedNode.ip}</span>
                </div>
              </div>

              <StatusBadge status={selectedNode.status} />

              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['Type', selectedNode.type],
                  ['Location', selectedNode.location],
                  ...(selectedDevice ? [
                    ['OS', selectedDevice.os ?? '—'],
                    ['MAC', selectedDevice.mac ?? '—'],
                    ['Scan source', selectedDevice.scanSource],
                    ['Last seen', selectedDevice.lastSeen ?? '—'],
                  ] : []),
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <span style={{ color: 'var(--muted)' }}>{k}</span>
                    <span style={{ color: 'var(--text)', textAlign: 'right', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</span>
                  </div>
                ))}
              </div>

              {selectedDevice?.services && selectedDevice.services.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Eyebrow style={{ display: 'block', marginBottom: 10 }}>Open services</Eyebrow>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {selectedDevice.services.map(svc => (
                      <span key={svc.port} style={{ padding: '3px 7px', border: '1px solid var(--border-bright)', borderRadius: 4, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--cyan)' }}>
                        {svc.port}/{svc.service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDevice?.tags && selectedDevice.tags.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Eyebrow style={{ display: 'block', marginBottom: 10 }}>Tags</Eyebrow>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {selectedDevice.tags.map(tag => (
                      <span key={tag} style={{ padding: '3px 8px', background: 'var(--panel-soft)', borderRadius: 4, fontSize: 11, color: 'var(--muted)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDevice?.description && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 6, fontSize: 12, color: 'var(--muted)' }}>
                  {selectedDevice.description}
                </div>
              )}

              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Btn style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('devices')}>View in inventory</Btn>
                <Btn style={{ width: '100%', justifyContent: 'center' }}>Trigger rescan</Btn>
                <Btn variant="ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--red)' }}>Remove from topology</Btn>
              </div>

              {/* Connected nodes */}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <Eyebrow style={{ display: 'block', marginBottom: 10 }}>Connected nodes</Eyebrow>
                {TOPO_EDGES.filter(e => e.source === selectedId || e.target === selectedId).map(edge => {
                  const otherId = edge.source === selectedId ? edge.target : edge.source
                  const other = TOPO_NODES.find(n => n.id === otherId)
                  if (!other) return null
                  return (
                    <button key={edge.id} onClick={() => setSelectedId(otherId)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 0', border: 0, borderBottom: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>
                      <DeviceTypeIcon type={other.type} size={14} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{other.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>{other.ip}</div>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--faint)' }}>{edge.type}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  )
}
