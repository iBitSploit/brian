import { useState, useEffect, useCallback } from 'react'
import { DashboardView } from './views/Dashboard'
import { TopologyView } from './views/Topology'
import { DevicesView } from './views/Devices'
import { IntegrationsView } from './views/Integrations'
import { AgentsView } from './views/Agents'
import { ScansView } from './views/Scans'
import { IconsView } from './views/Icons'
import { SettingsView } from './views/Settings'
import { HelpView } from './views/Help'
import { DEVICES, AGENTS } from './data'

export type View = 'dashboard' | 'topology' | 'devices' | 'integrations' | 'agents' | 'scans' | 'icons' | 'settings' | 'help'
export type Theme = 'dark' | 'light'

const VIEW_LABELS: Record<View, string> = {
  dashboard: 'Dashboard', topology: 'Topology', devices: 'Devices',
  integrations: 'Integrations', agents: 'Agents', scans: 'Scan uploads',
  icons: 'Icon library', settings: 'Settings', help: 'Documentation',
}

const NAV: { section: string; items: { view: View; icon: string; label: string; count?: number }[] }[] = [
  {
    section: 'Workspace',
    items: [
      { view: 'dashboard', icon: '⌂', label: 'Dashboard' },
      { view: 'topology', icon: '⌘', label: 'Topology' },
      { view: 'devices', icon: '▦', label: 'Devices', count: DEVICES.length },
      { view: 'scans', icon: '⌁', label: 'Scan uploads' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { view: 'integrations', icon: '↗', label: 'Integrations' },
      { view: 'agents', icon: '◈', label: 'Agents', count: AGENTS.length },
      { view: 'icons', icon: '✦', label: 'Icon library' },
    ],
  },
  {
    section: 'System',
    items: [
      { view: 'settings', icon: '⚙', label: 'Settings' },
      { view: 'help', icon: '?', label: 'Documentation' },
    ],
  },
]

function Toast({ message }: { message: string | null }) {
  return (
    <div style={{
      position: 'fixed', right: 25, bottom: 25, zIndex: 100,
      transform: message ? 'translateY(0)' : 'translateY(90px)',
      padding: '11px 16px', border: '1px solid var(--accent)', borderRadius: 8,
      background: 'var(--panel-strong)', color: 'var(--text)', boxShadow: 'var(--shadow)',
      transition: '.25s cubic-bezier(.34,1.56,.64,1)', pointerEvents: 'none', fontSize: 13,
    }}>{message ?? ''}</div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('brian-theme') as Theme) ?? 'dark')
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('brian-theme', theme)
  }, [theme])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }, [])

  const navigate = useCallback((v: View) => {
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    showToast(next === 'dark' ? 'Dark theme enabled' : 'Light theme enabled')
  }

  const onlineDevices = DEVICES.filter(d => d.status === 'online').length
  const offlineDevices = DEVICES.filter(d => d.status === 'offline').length
  const degradedAgents = AGENTS.filter(a => a.status === 'degraded').length

  return (
    <div data-theme={theme} style={{ display: 'grid', gridTemplateColumns: '238px minmax(0,1fr)', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <aside style={{ display: 'flex', flexDirection: 'column', padding: '22px 14px 18px', borderRight: '1px solid var(--border)', background: 'var(--panel)', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '2px 10px 22px' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, border: '1px solid var(--accent)', borderRadius: 8, color: 'var(--accent)', fontWeight: 800, fontSize: 16, transform: 'rotate(-8deg)', flexShrink: 0 }}>B</span>
          <span>
            <span style={{ display: 'block', fontSize: 18, fontWeight: 700, letterSpacing: '-.04em', lineHeight: 1.1 }}>brian</span>
            <span style={{ display: 'block', color: 'var(--muted)', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>network intel</span>
          </span>
        </div>

        {/* Status bar */}
        <div style={{ margin: '0 2px 20px', padding: '10px 12px', background: 'var(--panel-strong)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
            <span style={{ color: 'var(--muted)' }}>Devices</span>
            <span style={{ color: offlineDevices > 0 ? 'var(--amber)' : 'var(--accent)' }}>{onlineDevices}/{DEVICES.length} online</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'var(--muted)' }}>Agents</span>
            <span style={{ color: degradedAgents > 0 ? 'var(--amber)' : 'var(--accent)' }}>
              {AGENTS.filter(a => a.status === 'online').length}/{AGENTS.length} active{degradedAgents > 0 ? ` · ${degradedAgents} degraded` : ''}
            </span>
          </div>
          {degradedAgents > 0 && (
            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚠</span> Legacy-DC2-Scanner degraded
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {NAV.map(({ section, items }, si) => (
            <div key={section} style={{ marginBottom: 24 }}>
              <div style={{ padding: '0 10px 8px', color: 'var(--faint)', fontSize: 10, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase' }}>{section}</div>
              <div style={{ display: 'grid', gap: 2 }}>
                {items.map(({ view: v, icon, label, count }) => {
                  const active = view === v
                  return (
                    <button key={v} onClick={() => navigate(v)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px',
                      border: `1px solid ${active ? 'var(--border-bright)' : 'transparent'}`,
                      borderRadius: 7, background: active ? 'var(--panel-strong)' : 'transparent',
                      color: active ? 'var(--accent)' : 'var(--muted)', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
                      transition: '.15s ease',
                    }}>
                      <span style={{ width: 18, textAlign: 'center', fontSize: 14, flexShrink: 0 }}>{icon}</span>
                      <span style={{ flex: 1 }}>{label}</span>
                      {count !== undefined && (
                        <span style={{ fontSize: 10, color: active ? 'var(--accent)' : 'var(--faint)', background: 'var(--panel-soft)', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>{count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 10px 0', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--faint)' }}>
          <div>brian v0.9.1-alpha</div>
          <div>Open-source · Self-hosted</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, height: 66,
          padding: '0 28px', borderBottom: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--bg) 85%, transparent)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13 }}>
            <span>Workspace</span>
            <span style={{ color: 'var(--faint)' }}>/</span>
            <strong style={{ color: 'var(--text)', fontSize: 15 }}>{VIEW_LABELS[view]}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {/* Search */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 11px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--panel)', color: 'var(--muted)', width: 260, cursor: 'text' }}>
              <span style={{ flexShrink: 0, fontSize: 15 }}>⌕</span>
              <input
                type="search"
                placeholder="Search devices, IPs, tags…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', border: 0, outline: 0, background: 'transparent', color: 'var(--text)', padding: 0, fontSize: 13 }}
              />
            </label>

            {/* Theme toggle */}
            <button onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} style={{
              width: 34, height: 34, border: '1px solid var(--border-bright)', borderRadius: 7,
              background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 15, display: 'grid', placeItems: 'center',
            }}>◐</button>

            {/* Notifications */}
            <button title="Notifications" style={{ position: 'relative', width: 34, height: 34, border: '1px solid var(--border-bright)', borderRadius: 7, background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 15, display: 'grid', placeItems: 'center' }}>
              ♢
              {degradedAgents > 0 && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)', border: '1.5px solid var(--panel)' }} />}
            </button>

            <button onClick={() => navigate('topology')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, minHeight: 34,
              border: '1px solid var(--accent)', borderRadius: 7, background: 'var(--accent)', color: 'var(--accent-ink)',
              padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>⌘ Open topology</button>
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '26px 28px 60px', flex: 1 }}>
          {view === 'dashboard' && <DashboardView navigate={navigate} />}
          {view === 'topology' && <TopologyView navigate={navigate} />}
          {view === 'devices' && <DevicesView />}
          {view === 'integrations' && <IntegrationsView />}
          {view === 'agents' && <AgentsView />}
          {view === 'scans' && <ScansView />}
          {view === 'icons' && <IconsView />}
          {view === 'settings' && <SettingsView theme={theme} setTheme={t => { setTheme(t); showToast(t === 'dark' ? 'Dark theme enabled' : 'Light theme enabled') }} />}
          {view === 'help' && <HelpView navigate={navigate} />}
        </div>
      </main>

      <Toast message={toast} />
    </div>
  )
}
