import { useSystemAudio } from './hooks/useSystemAudio'
import { SettingsPanel } from './components/SettingsPanel'
import { SubtitleView } from './components/SubtitleView'

function App(): React.JSX.Element {
  const { capturing, level, error, stream, start, stop } = useSystemAudio()

  return (
    <div className="app">
      <header className="header">
        <h1>Tilmoch</h1>
        <p className="tagline">Real-time speech translator</p>
      </header>

      <main className="panel">
        <h2>System Audio Capture (POC)</h2>
        <p className="hint">
          Noutbukdan chiqayotgan ovozni ushlaymiz — video/YouTube tarjimasi uchun birinchi qadam.
        </p>

        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${Math.round(level * 100)}%` }} />
        </div>

        {error && <p className="error">{error}</p>}

        {capturing ? (
          <button className="btn btn-stop" onClick={stop}>
            Stop capture
          </button>
        ) : (
          <button className="btn btn-start" onClick={start}>
            Start system audio capture
          </button>
        )}

        <p className="status">
          {capturing ? 'Capturing… musiqa yoki video qoʻying — meter harakatlanishi kerak.' : 'Idle'}
        </p>
      </main>

      <main className="panel">
        <SubtitleView stream={stream} />
      </main>

      <main className="panel">
        <SettingsPanel />
      </main>
    </div>
  )
}

export default App
