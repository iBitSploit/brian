import type { DeviceStatus, DeviceType, AgentStatus } from '../data'

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <span style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', ...style }}>{children}</span>
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'online' | 'warn' | 'error' | 'info' }) {
  const colors: Record<string, { color: string; bg: string }> = {
    default: { color: 'var(--muted)', bg: 'var(--panel-soft)' },
    online: { color: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 10%, transparent)' },
    warn: { color: 'var(--amber)', bg: 'color-mix(in srgb, var(--amber) 10%, transparent)' },
    error: { color: 'var(--red)', bg: 'color-mix(in srgb, var(--red) 10%, transparent)' },
    info: { color: 'var(--cyan)', bg: 'color-mix(in srgb, var(--cyan) 10%, transparent)' },
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, ...colors[variant] }}>
      {children}
    </span>
  )
}

export function StatusDot({ status }: { status: DeviceStatus | AgentStatus }) {
  const map = { online: 'var(--accent)', offline: 'var(--red)', unknown: 'var(--amber)', degraded: 'var(--amber)' }
  const c = map[status] ?? 'var(--muted)'
  return <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 0 3px color-mix(in srgb, ${c} 20%, transparent)`, flexShrink: 0 }} />
}

export function StatusBadge({ status }: { status: DeviceStatus | AgentStatus }) {
  const map: Record<string, 'online' | 'warn' | 'error' | 'default'> = { online: 'online', offline: 'error', unknown: 'warn', degraded: 'warn' }
  const labels: Record<string, string> = { online: 'Online', offline: 'Offline', unknown: 'Unknown', degraded: 'Degraded' }
  return <Badge variant={map[status] ?? 'default'}>{labels[status] ?? status}</Badge>
}

export function DeviceTypeIcon({ type, size = 16 }: { type: DeviceType; size?: number }) {
  const icons: Record<DeviceType, string> = {
    server: '🖥', router: '🔀', firewall: '🛡', workstation: '💻',
    switch: '🔌', cloud: '☁', service: '⚙', 'access-point': '📡',
  }
  return <span style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>{icons[type] ?? '❓'}</span>
}

export function Btn({ children, variant = 'default', onClick, disabled, style, title }: {
  children: React.ReactNode; variant?: 'default' | 'primary' | 'ghost' | 'danger' | 'icon'
  onClick?: () => void; disabled?: boolean; style?: React.CSSProperties; title?: string
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    minHeight: 34, border: '1px solid var(--border-bright)', borderRadius: 7,
    background: 'var(--panel)', color: 'var(--text)', padding: '7px 13px',
    fontSize: 13, fontWeight: 500, transition: '.15s ease', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? .45 : 1, whiteSpace: 'nowrap', lineHeight: 1.2,
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: { borderColor: 'var(--accent)', background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 700 },
    ghost: { borderColor: 'transparent', background: 'transparent', color: 'var(--muted)' },
    danger: { color: 'var(--red)', borderColor: 'color-mix(in srgb, var(--red) 30%, transparent)' },
    icon: { width: 34, padding: 0, fontSize: 15 },
  }
  return <button style={{ ...base, ...(variants[variant] ?? {}), ...style }} onClick={onClick} disabled={disabled} title={title}>{children}</button>
}

export function Card({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--panel)', boxShadow: 'var(--shadow)', cursor: onClick ? 'pointer' : undefined, ...style }}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, badge, padding = true }: {
  title: string; subtitle?: string; action?: React.ReactNode; badge?: React.ReactNode; padding?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15, padding: padding ? '18px 18px 16px' : '0 0 16px', borderBottom: '1px solid var(--border)' }}>
      <div>
        <h2 style={{ margin: '0 0 3px' }}>{title}</h2>
        {subtitle && <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {badge}
        {action}
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, body, action }: { icon: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: 180, padding: 30, textAlign: 'center', color: 'var(--muted)' }}>
      <div>
        <div style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, margin: '0 auto 12px', border: '1px dashed var(--border-bright)', borderRadius: '50%', color: 'var(--accent)', fontSize: 20 }}>{icon}</div>
        <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 6 }}>{title}</strong>
        {body && <p style={{ margin: '0 0 14px', fontSize: 12, maxWidth: 340 }}>{body}</p>}
        {action}
      </div>
    </div>
  )
}

export function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 0, ...style }}>
      <label style={{ display: 'block', marginBottom: 6, color: 'var(--muted)', fontSize: 12, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

export function SearchInput({ placeholder, value, onChange, style }: {
  placeholder?: string; value?: string; onChange?: (v: string) => void; style?: React.CSSProperties
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--panel)', color: 'var(--muted)', cursor: 'text', ...style }}>
      <span style={{ flexShrink: 0 }}>⌕</span>
      <input type="search" placeholder={placeholder ?? 'Search…'} value={value} onChange={e => onChange?.(e.target.value)} style={{ width: '100%', border: 0, outline: 0, background: 'transparent', color: 'var(--text)', padding: 0, fontSize: 13 }} />
    </label>
  )
}

export function ViewHeading({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 24 }}>
      <div>{left}</div>
      <div style={{ display: 'flex', gap: 8 }}>{right}</div>
    </div>
  )
}

export function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ position: 'relative', width: 38, height: 22, flexShrink: 0, cursor: 'pointer', display: 'inline-block' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
      <span style={{ position: 'absolute', inset: 0, borderRadius: 20, background: checked ? 'var(--accent-strong)' : 'var(--border-bright)', transition: '.2s' }} />
      <span style={{ position: 'absolute', width: 16, height: 16, left: checked ? 19 : 3, top: 3, borderRadius: '50%', background: checked ? 'var(--accent-ink)' : 'var(--muted)', transition: '.2s' }} />
    </label>
  )
}

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
      {tabs.map(tab => (
        <button key={tab} onClick={() => onChange(tab)} style={{
          padding: '9px 15px', border: 0, borderBottom: `2px solid ${active === tab ? 'var(--accent)' : 'transparent'}`,
          background: 'transparent', color: active === tab ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: active === tab ? 600 : 400,
        }}>{tab}</button>
      ))}
    </div>
  )
}

export function Modal({ title, children, onClose, width = 560 }: {
  title: string; children: React.ReactNode; onClose: () => void; width?: number
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width, maxWidth: 'calc(100vw - 40px)', maxHeight: 'calc(100vh - 60px)', overflowY: 'auto', border: '1px solid var(--border-bright)', borderRadius: 12, background: 'var(--panel-strong)', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 28, height: 28, border: 0, borderRadius: 6, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

export function Mono({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{children}</span>
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h1 style={{ marginBottom: 4, fontSize: 22, fontWeight: 700, letterSpacing: '-.03em' }}>{children}</h1>
}

export function SettingRow({ title, desc, control }: { title: string; desc: string; control: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
      <div>
        <strong style={{ display: 'block', marginBottom: 3, fontSize: 13 }}>{title}</strong>
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>{desc}</span>
      </div>
      {control}
    </div>
  )
}

export function TableCard({ children }: { children: React.ReactNode }) {
  return <Card style={{ overflow: 'hidden' }}><div style={{ overflowX: 'auto' }}>{children}</div></Card>
}
