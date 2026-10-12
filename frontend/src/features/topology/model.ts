export type NodeKind = 'router' | 'switch' | 'firewall' | 'server' | 'cloud'
export type Tool = 'select' | 'link' | 'delete'

export interface Iface {
  id: string
  name: string
  up: boolean
}

export interface TopoNode {
  id: string
  name: string
  kind: NodeKind
  x: number
  y: number
  interfaces: Iface[]
}

export interface PortRef {
  nodeId: string
  ifaceId: string
}

export interface TopoLink {
  id: string
  a: PortRef
  b: PortRef
}

export type Selection = { type: 'node' | 'link'; id: string } | null

interface KindMeta {
  label: string
  icon: string
  prefix: string
  ports: number
  ifaceName: (index: number) => string
}

export const KIND_META: Record<NodeKind, KindMeta> = {
  router: { label: 'Router', icon: '◎', prefix: 'R', ports: 4, ifaceName: (i) => `Gi0/${i}` },
  switch: { label: 'Switch', icon: '▤', prefix: 'SW', ports: 8, ifaceName: (i) => `Fa0/${i + 1}` },
  firewall: { label: 'Firewall', icon: '⛨', prefix: 'FW', ports: 3, ifaceName: (i) => `eth${i}` },
  server: { label: 'Server', icon: '▦', prefix: 'SRV', ports: 1, ifaceName: () => 'eth0' },
  cloud: { label: 'Network', icon: '☁', prefix: 'NET', ports: 2, ifaceName: (i) => `port${i + 1}` },
}

export const KINDS = Object.keys(KIND_META) as NodeKind[]

// Layout constants shared by the node renderer and the link geometry.
export const WORLD_W = 2400
export const WORLD_H = 1600
export const NODE_W = 176
export const HEADER_H = 36
export const ROW_H = 28
export const PILL_W = 76
export const PILL_H = 22
export const PILL_GAP = 8

export function nodeHeight(node: TopoNode): number {
  const rows = Math.max(1, Math.ceil(node.interfaces.length / 2))
  return HEADER_H + rows * ROW_H + 6
}

export function pillPosition(index: number): { left: number; top: number } {
  const col = index % 2
  const row = Math.floor(index / 2)
  return {
    left: PILL_GAP + col * (PILL_W + PILL_GAP),
    top: HEADER_H + row * ROW_H + (ROW_H - PILL_H) / 2,
  }
}

export interface Anchor {
  x: number
  y: number
  dir: number
}

// Interfaces on the left column connect from the node's left edge, right column from the right edge.
export function portAnchor(node: TopoNode, index: number): Anchor {
  const col = index % 2
  const row = Math.floor(index / 2)
  return {
    x: col === 0 ? node.x : node.x + NODE_W,
    y: node.y + HEADER_H + row * ROW_H + ROW_H / 2,
    dir: col === 0 ? -1 : 1,
  }
}

export function linkPath(a: Anchor, b: Anchor): string {
  const reach = Math.max(60, Math.abs(b.x - a.x) * 0.5)
  return `M ${a.x} ${a.y} C ${a.x + a.dir * reach} ${a.y}, ${b.x + b.dir * reach} ${b.y}, ${b.x} ${b.y}`
}

export function samePort(a: PortRef, b: PortRef): boolean {
  return a.nodeId === b.nodeId && a.ifaceId === b.ifaceId
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function makeNode(kind: NodeKind, existing: TopoNode[]): TopoNode {
  const meta = KIND_META[kind]
  const id = newId(kind)
  const sameKind = existing.filter((n) => n.kind === kind).length + 1
  const slot = existing.length
  return {
    id,
    name: `${meta.prefix}${sameKind}`,
    kind,
    x: 60 + (slot % 3) * 220,
    y: 60 + Math.floor(slot / 3) * 230,
    interfaces: Array.from({ length: meta.ports }, (_, i) => ({
      id: `${id}-p${i}`,
      name: meta.ifaceName(i),
      up: true,
    })),
  }
}
