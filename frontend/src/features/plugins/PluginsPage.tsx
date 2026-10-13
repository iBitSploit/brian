import { useEffect, useMemo, useState } from 'react'
import './plugins.css'

type Plugin = {
  id: string
  name: string
  category: string
  description: string
  icon: string
  capabilities: string[]
  repository?: string | null
  version?: string | null
  installed: boolean
  status: string
}

type CatalogResponse = { source: string; plugins: Plugin[] }

const API_BASE = (import.meta.env.VITE_BRIAN_API_URL ?? '').replace(/\/$/, '')
const CATEGORIES = ['All', 'Security', 'Networking', 'Development', 'Infrastructure']

const ICONS: Record<string, string> = {
  'shield-check': '⬡',
  network: '⌘',
  server: '▤',
  bug: '⌬',
  'git-branch': '⑂',
  'monitor-cog': '▣',
  blocks: '▦',
}

export default function PluginsPage({ notify }: { notify: (message: string) => void }) {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)
  const [source, setSource] = useState('central-catalog')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [installing, setInstalling] = useState<string | null>(null)

  async function loadCatalog() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/api/plugins/catalog`, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`Catalog request failed (${response.status})`)
      const payload = (await response.json()) as CatalogResponse
      setPlugins(Array.isArray(payload.plugins) ? payload.plugins : [])
      setSource(payload.source ?? 'central-catalog')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load the plugin catalog')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadCatalog() }, [])

  const filtered = useMemo(() => plugins.filter((plugin) => {
    const matchesCategory = category === 'All' || plugin.category === category
    const haystack = `${plugin.name} ${plugin.description} ${plugin.category} ${plugin.capabilities.join(' ')}`.toLowerCase()
    return matchesCategory && haystack.includes(query.toLowerCase())
  }), [plugins, category, query])

  async function installPlugin(plugin: Plugin) {
    setInstalling(plugin.id)
    try {
      const response = await fetch(`${API_BASE}/api/plugins/${encodeURIComponent(plugin.id)}/install`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      })
      const payload = await response.json().catch(() => ({})) as { detail?: string }
      if (!response.ok) throw new Error(payload.detail ?? `Installation failed (${response.status})`)
      notify(`${plugin.name} installed`)
      await loadCatalog()
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : 'Plugin installation failed')
    } finally {
      setInstalling(null)
    }
  }

  const installedCount = plugins.filter((plugin) => plugin.installed).length

  return (
    <section className="plugins-page">
      <div className="plugins-heading">
        <div className="plugins-title-wrap">
          <div className="plugins-title-icon">▦</div>
          <div>
            <div className="eyebrow">EXTEND BRIAN</div>
            <h1>Plugins</h1>
            <p>Discover connectors and additional features for your Brian instance.</p>
          </div>
        </div>
        <button className="button" onClick={() => void loadCatalog()} disabled={loading}>
          {loading ? 'Refreshing…' : '↻ Refresh catalog'}
        </button>
      </div>

      <div className="plugins-stats">
        <div className="plugins-stat"><span>Available</span><strong>{plugins.length}</strong></div>
        <div className="plugins-stat"><span>Installed</span><strong>{installedCount}</strong></div>
        <div className="plugins-stat"><span>Updates</span><strong>—</strong></div>
      </div>

      <div className="plugins-toolbar">
        <label className="plugins-search">
          <span>⌕</span>
          <input aria-label="Search plugins" type="search" placeholder="Search plugins…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <span className="plugins-source"><span className="plugins-source-dot" /> Catalog: {source === 'central-catalog' ? 'Central server' : 'Local catalog'}</span>
      </div>

      <div className="plugins-categories" role="group" aria-label="Filter by category">
        {CATEGORIES.map((item) => (
          <button key={item} className={category === item ? 'plugins-category active' : 'plugins-category'} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="plugins-state"><span className="plugins-spinner" /> Loading plugin catalog…</div>
      ) : error ? (
        <div className="plugins-state plugins-error">
          <strong>Could not reach the plugin catalog</strong>
          <p>{error}</p>
          <button className="button" onClick={() => void loadCatalog()}>Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="plugins-state"><div className="plugins-empty-icon">⌕</div><strong>No plugins match your search</strong><p>Try another name or category.</p></div>
      ) : (
        <div className="plugins-grid">
          {filtered.map((plugin) => {
            const expanded = selected === plugin.id
            return (
              <article className={`plugin-card${expanded ? ' expanded' : ''}`} key={plugin.id}>
                <button className="plugin-card-main" onClick={() => setSelected(expanded ? null : plugin.id)} aria-expanded={expanded}>
                  <span className={`plugin-icon plugin-icon-${plugin.category.toLowerCase()}`}>{ICONS[plugin.icon] ?? ICONS.blocks}</span>
                  <span className="plugin-card-identity">
                    <strong>{plugin.name}</strong>
                    <small>{plugin.category}</small>
                  </span>
                  <span className="plugin-chevron">{expanded ? '⌄' : '›'}</span>
                </button>
                <p className="plugin-description">{plugin.description}</p>
                <div className="plugin-card-footer">
                  <span className={plugin.installed ? 'plugin-status installed' : 'plugin-status'}><i />{plugin.installed ? 'Installed' : 'Available'}</span>
                  <span className="plugin-type">{plugin.capabilities[0]?.replaceAll('-', ' ') ?? 'Integration'}</span>
                </div>
                {expanded && (
                  <div className="plugin-details">
                    <div className="plugin-detail-heading">Plugin details</div>
                    <p>Review the plugin's capabilities, permissions, compatibility, and release information before installation.</p>
                    {plugin.version && <div className="plugin-version">Catalog version <strong>{plugin.version}</strong></div>}
                    <div className="plugin-capabilities">{plugin.capabilities.map((capability) => <span key={capability}>{capability.replaceAll('-', ' ')}</span>)}</div>
                    {plugin.repository && <a href={plugin.repository} target="_blank" rel="noreferrer">Source repository ↗</a>}
                    <button className="button primary plugin-install" disabled={plugin.installed || installing !== null} onClick={() => void installPlugin(plugin)}>
                      {installing === plugin.id ? 'Installing…' : plugin.installed ? 'Installed' : 'Install plugin'}
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      <div className="plugins-footnote">
        <span>◇</span>
        <p>Open source · Community maintained · Review permissions and package provenance before installing third-party plugins.</p>
      </div>
    </section>
  )
}
