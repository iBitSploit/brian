import TopologyDashboard from './TopologyDashboard'

type Props = {
  notify: (message: string) => void
  toast: string | null
  onBack: () => void
}

// Full-window topology screen: replaces the app shell (sidebar and top bar) while it is open.
export default function TopologyPage({ notify, toast, onBack }: Props) {
  return (
    <div className="topo-page">
      <header className="topo-page-header">
        <div className="topo-page-brand">
          <span className="brand-mark">B</span>
          <span className="brand-name">brian</span>
          <span className="eyebrow">topology</span>
        </div>
        <button className="button" onClick={onBack}>
          ← Back to workspace
        </button>
      </header>
      <div className="topo-page-body">
        <TopologyDashboard notify={notify} />
      </div>
      <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
        {toast ?? ''}
      </div>
    </div>
  )
}
