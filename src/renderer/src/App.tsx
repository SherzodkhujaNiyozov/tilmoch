import { useState } from 'react'
import { useSystemAudio } from './hooks/useSystemAudio'
import { SettingsPanel } from './components/SettingsPanel'
import { MeetingPanel } from './components/MeetingPanel'
import { VideoTab } from './components/VideoTab'

type Tab = 'video' | 'meeting' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'video', label: '📺 Video tarjima' },
  { id: 'meeting', label: '🎙️ Meeting' },
  { id: 'settings', label: '⚙️ Sozlamalar' }
]

function App(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>('video')
  // Capture holati App darajasida — tab almashganda to'xtab qolmasin
  const audio = useSystemAudio()

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-name">Tilmoch</span>
          <span className="brand-sub">real-time tarjimon</span>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.id === 'video' && audio.capturing && <span className="live-dot" />}
            </button>
          ))}
        </nav>
      </header>

      {/* Panellar yashirinadi, lekin unmount bo'lmaydi — stream/mikrofon uzilmasin */}
      <div className={`tab-content ${tab === 'video' ? '' : 'hidden'}`}>
        <VideoTab audio={audio} />
      </div>
      <div className={`tab-content ${tab === 'meeting' ? '' : 'hidden'}`}>
        <div className="tab-page">
          <MeetingPanel />
        </div>
      </div>
      <div className={`tab-content ${tab === 'settings' ? '' : 'hidden'}`}>
        <div className="tab-page">
          <SettingsPanel />
        </div>
      </div>
    </div>
  )
}

export default App
