import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  KIND_META,
  KINDS,
  NODE_W,
  WORLD_H,
  WORLD_W,
  linkPath,
  makeNode,
  newId,
  nodeHeight,
  pillPosition,
  portAnchor,
  samePort,
  type Anchor,
  type PortRef,
  type Selection,
  type Tool,
  type TopoLink,
  type TopoNode,
} from './model'
import './topology.css'

type Props = { notify: (message: string) => void }

const TOOLS: { id: Tool; label: string; icon: string; hint: string }[] = [
  { id: 'select', label: 'Select', icon: '↖', hint: 'Drag devices to arrange them. Click to inspect.' },
  { id: 'link', label: 'Link', icon: '⇄', hint: 'Click one interface, then one on a different device to connect them.' },
  { id: 'delete', label: 'Delete', icon: '⌫', hint: 'Click a device, interface or link to remove it.' },
]

const MIN_SCALE = 0.5
const MAX_SCALE = 1.5

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export default function TopologyDashboard({ notify }: Props) {
  const [nodes, setNodes] = useState<TopoNode[]>([])
  const [links, setLinks] = useState<TopoLink[]>([])
  const [selection, setSelection] = useState<Selection>(null)
  const [tool, setTool] = useState<Tool>('select')
  const [pending, setPending] = useState<PortRef | null>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [palettePinned, setPalettePinned] = useState(true)
  const [drag, setDrag] = useState<{ id: string; startX: number; startY: number; originX: number; originY: number } | null>(null)
  const worldRef = useRef<HTMLDivElement>(null)

  const nodeById = useMemo(() => new Map<string, TopoNode>(nodes.map((n) => [n.id, n] as const)), [nodes])
  const selectedNode = selection?.type === 'node' ? nodeById.get(selection.id) : undefined
  const selectedLink = selection?.type === 'link' ? links.find((l) => l.id === selection.id) : undefined
  const linkedPorts = useMemo(() => links.flatMap((l) => [l.a, l.b]), [links])
  const downCount = nodes.reduce((sum, n) => sum + n.interfaces.filter((i) => !i.up).length, 0)

  function portLinked(port: PortRef): boolean {
    return linkedPorts.some((p) => samePort(p, port))
  }

  function ifaceOf(port: PortRef) {
    return nodeById.get(port.nodeId)?.interfaces.find((i) => i.id === port.ifaceId)
  }

  function portLabel(port: PortRef): string {
    const node = nodeById.get(port.nodeId)
    const iface = ifaceOf(port)
    return node && iface ? `${node.name} · ${iface.name}` : 'Unknown'
  }

  function linkUp(link: TopoLink): boolean {
    return ifaceOf(link.a)?.up === true && ifaceOf(link.b)?.up === true
  }

  function anchorOf(port: PortRef): Anchor | null {
    const node = nodeById.get(port.nodeId)
    if (!node) return null
    const index = node.interfaces.findIndex((i) => i.id === port.ifaceId)
    return index < 0 ? null : portAnchor(node, index)
  }

  // Mutations

  function addNode(kind: (typeof KINDS)[number]) {
    const node = makeNode(kind, nodes)
    setNodes((list) => [...list, node])
    setSelection({ type: 'node', id: node.id })
  }

  function removeNode(id: string) {
    setNodes((list) => list.filter((n) => n.id !== id))
    setLinks((list) => list.filter((l) => l.a.nodeId !== id && l.b.nodeId !== id))
    setSelection((s) => (s?.id === id ? null : s))
    setPending((p) => (p?.nodeId === id ? null : p))
  }

  function removeLink(id: string) {
    setLinks((list) => list.filter((l) => l.id !== id))
    setSelection((s) => (s?.id === id ? null : s))
  }

  function renameNode(id: string, name: string) {
    setNodes((list) => list.map((n) => (n.id === id ? { ...n, name } : n)))
  }

  function setIfaceUp(nodeId: string, ifaceId: string, up: boolean) {
    setNodes((list) =>
      list.map((n) =>
        n.id !== nodeId
          ? n
          : { ...n, interfaces: n.interfaces.map((i) => (i.id === ifaceId ? { ...i, up } : i)) },
      ),
    )
  }

  function setLinkUp(link: TopoLink, up: boolean) {
    setIfaceUp(link.a.nodeId, link.a.ifaceId, up)
    setIfaceUp(link.b.nodeId, link.b.ifaceId, up)
  }

  function clearAll() {
    setNodes([])
    setLinks([])
    setSelection(null)
    setPending(null)
  }

  // Interaction

  function onNodeClick(id: string) {
    if (tool === 'delete') {
      const name = nodeById.get(id)?.name ?? 'Device'
      removeNode(id)
      notify(`${name} removed`)
      return
    }
    setSelection({ type: 'node', id })
  }

  function onPortClick(port: PortRef) {
    if (tool === 'delete') {
      const link = links.find((l) => samePort(l.a, port) || samePort(l.b, port))
      if (link) {
        removeLink(link.id)
        notify('Link removed')
      } else {
        notify('Nothing is connected to that interface')
      }
      return
    }

    if (tool === 'link') {
      if (!pending) {
        if (portLinked(port)) notify('That interface is already connected')
        else setPending(port)
        return
      }
      if (samePort(pending, port)) {
        setPending(null)
        return
      }
      if (pending.nodeId === port.nodeId) {
        notify('Pick an interface on a different device')
        return
      }
      if (portLinked(port)) {
        notify('That interface is already connected')
        return
      }
      const link: TopoLink = { id: newId('link'), a: pending, b: port }
      setLinks((list) => [...list, link])
      setPending(null)
      setSelection({ type: 'link', id: link.id })
      return
    }

    setSelection({ type: 'node', id: port.nodeId })
  }

  function onLinkClick(id: string) {
    if (tool === 'delete') {
      removeLink(id)
      notify('Link removed')
      return
    }
    setSelection({ type: 'link', id })
  }

  function onWorldPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pending) return
    const rect = worldRef.current?.getBoundingClientRect()
    if (!rect) return
    setCursor({ x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale })
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>, node: TopoNode) {
    if (tool === 'delete') return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({ id: node.id, startX: event.clientX, startY: event.clientY, originX: node.x, originY: node.y })
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag) return
    const x = clamp(drag.originX + (event.clientX - drag.startX) / scale, 0, WORLD_W - NODE_W)
    const y = clamp(drag.originY + (event.clientY - drag.startY) / scale, 0, WORLD_H - 80)
    setNodes((list) => list.map((n) => (n.id === drag.id ? { ...n, x, y } : n)))
  }

  function zoomBy(delta: number) {
    setScale((s) => clamp(Math.round((s + delta) * 10) / 10, MIN_SCALE, MAX_SCALE))
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof Element && event.target.closest('input, select, textarea')) return
      if (event.key === 'Escape') {
        setTool('select')
        setPending(null)
        return
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selection) {
        if (selection.type === 'node') removeNode(selection.id)
        else removeLink(selection.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selection])

  const pendingAnchor = pending ? anchorOf(pending) : null
  const activeTool = TOOLS.find((t) => t.id === tool) ?? TOOLS[0]

  return (
    <div className="topo-dash">
      <div className="topo-toolbar">
        <div className="topo-group">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`topo-tool${tool === t.id ? ' active' : ''}`}
              onClick={() => {
                setTool(t.id)
                setPending(null)
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div className="topo-group">
          <button className="topo-tool" title="Zoom out" onClick={() => zoomBy(-0.1)} disabled={scale <= MIN_SCALE}>
            −
          </button>
          <span className="topo-zoom">{Math.round(scale * 100)}%</span>
          <button className="topo-tool" title="Zoom in" onClick={() => zoomBy(0.1)} disabled={scale >= MAX_SCALE}>
            ＋
          </button>
          <button className="topo-tool" title="Reset zoom" onClick={() => setScale(1)}>
            ⌗
          </button>
          <button
            className={`topo-tool${showGrid ? ' active' : ''}`}
            title="Toggle grid"
            onClick={() => setShowGrid((g) => !g)}
          >
            ▦
          </button>
        </div>

        <div className="topo-group topo-group-plain">
          <button className="button ghost" onClick={clearAll} disabled={nodes.length === 0}>
            Clear canvas
          </button>
        </div>
      </div>

      <div className="topo-body">
        <aside className={`topo-palette${palettePinned ? '' : ' collapsed'}`}>
          <button
            className="topo-collapse"
            onClick={() => setPalettePinned((p) => !p)}
            aria-label={palettePinned ? 'Collapse device panel' : 'Expand device panel'}
            title={palettePinned ? 'Collapse' : 'Expand'}
          >
            {palettePinned ? '‹' : '›'}
          </button>
          {palettePinned && <div className="eyebrow">Add device</div>}
          {KINDS.map((kind) => (
            <button key={kind} className="topo-kind" title={KIND_META[kind].label} onClick={() => addNode(kind)}>
              <span className="topo-kind-icon">{KIND_META[kind].icon}</span>
              {palettePinned && <span>{KIND_META[kind].label}</span>}
            </button>
          ))}
        </aside>

        <div className="topo-viewport">
          <div className="topo-scroll" style={{ width: WORLD_W * scale, height: WORLD_H * scale }}>
            <div
              ref={worldRef}
              className={`topo-world${showGrid ? ' grid' : ''}`}
              style={{ width: WORLD_W, height: WORLD_H, transform: `scale(${scale})` }}
              onClick={() => {
                setSelection(null)
                setPending(null)
              }}
              onPointerMove={onWorldPointerMove}
            >
              <svg className="topo-links" width={WORLD_W} height={WORLD_H} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}>
                {links.map((link) => {
                  const a = anchorOf(link.a)
                  const b = anchorOf(link.b)
                  if (!a || !b) return null
                  const d = linkPath(a, b)
                  const selected = selection?.type === 'link' && selection.id === link.id
                  return (
                    <g key={link.id}>
                      <path
                        d={d}
                        className="topo-link-hit"
                        onClick={(e) => {
                          e.stopPropagation()
                          onLinkClick(link.id)
                        }}
                      />
                      <path d={d} className={`topo-link${linkUp(link) ? ' up' : ' down'}${selected ? ' selected' : ''}`} />
                    </g>
                  )
                })}
                {pendingAnchor && cursor && (
                  <path
                    d={`M ${pendingAnchor.x} ${pendingAnchor.y} L ${cursor.x} ${cursor.y}`}
                    className="topo-link-preview"
                  />
                )}
              </svg>

              {nodes.map((node) => {
                const selected = selection?.type === 'node' && selection.id === node.id
                const meta = KIND_META[node.kind]
                return (
                  <div
                    key={node.id}
                    className={`topo-node${selected ? ' selected' : ''}`}
                    style={{ left: node.x, top: node.y, width: NODE_W, height: nodeHeight(node) }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onNodeClick(node.id)
                    }}
                  >
                    <div
                      className="topo-node-head"
                      onPointerDown={(e) => startDrag(e, node)}
                      onPointerMove={moveDrag}
                      onPointerUp={() => setDrag(null)}
                      onPointerCancel={() => setDrag(null)}
                    >
                      <span className="topo-node-icon">{meta.icon}</span>
                      <span className="topo-node-name">{node.name}</span>
                    </div>
                    {node.interfaces.map((iface, index) => {
                      const port: PortRef = { nodeId: node.id, ifaceId: iface.id }
                      const isPending = pending !== null && samePort(pending, port)
                      const classes = [
                        'topo-port',
                        portLinked(port) && 'linked',
                        !iface.up && 'down',
                        isPending && 'pending',
                      ]
                        .filter(Boolean)
                        .join(' ')
                      return (
                        <button
                          key={iface.id}
                          className={classes}
                          style={pillPosition(index)}
                          title={`${iface.name} · ${iface.up ? 'up' : 'down'}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onPortClick(port)
                          }}
                        >
                          {iface.name}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {nodes.length === 0 && (
            <div className="topo-empty">
              <div>
                <div className="empty-mark" style={{ margin: '0 auto 13px' }}>⌘</div>
                <strong>Your topology is empty</strong>
                <p>Add a device from the left panel to start building.</p>
              </div>
            </div>
          )}
        </div>

        <aside className="topo-inspector">
          <div className="eyebrow">Inspector</div>

          {selectedNode ? (
            <>
              <div className="topo-insp-block">
                <label className="field-label" htmlFor="topo-name">Name</label>
                <input
                  id="topo-name"
                  value={selectedNode.name}
                  onChange={(e) => renameNode(selectedNode.id, e.target.value)}
                />
                <span className="muted small">
                  {KIND_META[selectedNode.kind].label} · {links.filter((l) => l.a.nodeId === selectedNode.id || l.b.nodeId === selectedNode.id).length} links
                </span>
              </div>

              <div className="topo-iface-list">
                {selectedNode.interfaces.map((iface) => (
                  <div className="topo-iface-row" key={iface.id}>
                    <div>
                      <strong>{iface.name}</strong>
                      <div className={`small ${iface.up ? 'online-text' : 'error-text'}`}>{iface.up ? 'Up' : 'Down'}</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={iface.up}
                        aria-label={`${iface.name} enabled`}
                        onChange={(e) => setIfaceUp(selectedNode.id, iface.id, e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                ))}
              </div>

              <button className="button danger" onClick={() => removeNode(selectedNode.id)}>
                Delete device
              </button>
            </>
          ) : selectedLink ? (
            <>
              <div className="topo-insp-block">
                <span className={`badge ${linkUp(selectedLink) ? 'online' : 'error'}`}>
                  {linkUp(selectedLink) ? 'Up' : 'Down'}
                </span>
              </div>
              <div className="topo-end">
                <span className="eyebrow">A end</span>
                <strong>{portLabel(selectedLink.a)}</strong>
              </div>
              <div className="topo-end">
                <span className="eyebrow">B end</span>
                <strong>{portLabel(selectedLink.b)}</strong>
              </div>
              <button className="button" onClick={() => setLinkUp(selectedLink, !linkUp(selectedLink))}>
                {linkUp(selectedLink) ? 'Shut down both ends' : 'Bring both ends up'}
              </button>
              <button className="button danger" onClick={() => removeLink(selectedLink.id)}>
                Delete link
              </button>
            </>
          ) : (
            <>
              <p className="muted small">Select a device or link to inspect it.</p>
              <div className="topo-stat"><span>Devices</span><strong>{nodes.length}</strong></div>
              <div className="topo-stat"><span>Links</span><strong>{links.length}</strong></div>
              <div className="topo-stat"><span>Interfaces down</span><strong>{downCount}</strong></div>
              <p className="muted small">Interface changes are local to this view. They aren't sent to devices yet.</p>
            </>
          )}
        </aside>
      </div>

      <div className="topo-status">
        <span>{activeTool.hint}</span>
        {pending && <span className="badge warn">Linking from {portLabel(pending)}</span>}
        <span className="topo-status-end">
          {nodes.length} devices · {links.length} links
        </span>
      </div>
    </div>
  )
}
