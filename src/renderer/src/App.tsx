import { useSystemAudio } from './hooks/useSystemAudio'
import { SettingsPanel } from './components/SettingsPanel'
import { SubtitleView } from './components/SubtitleView'
import { MeetingPanel } from './components/MeetingPanel'

function App(): React.JSX.Element {
  const { capturing, level, error, stream, start, stop } = useSystemAudio()

  return (
    <div className="app">
      <header className="header">
        <h1>Tilmoch</h1>
        <p className="tagline">Real-time speech translator</p>
      </header>

      <main className="panel">
        <h2>⬇️ Kiruvchi tarjima — video va suhbatdosh ovozi</h2>
        <p className="hint">
          Noutbukdan chiqayotgan har qanday ovozni (YouTube, video, Zoom'dagi suhbatdosh gapi)
          tahlil qilib, pastdagi Subtitle panelida tarjima qiladi. Suhbatdoshni tushunish uchun
          shu tugmani bosing.
        </p>

        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${Math.round(level * 100)}%` }} />
        </div>

        {error && <p className="error">{error}</p>}

        {capturing ? (
          <button className="btn btn-stop" onClick={stop}>
            Kiruvchi tarjimani toʻxtatish
          </button>
        ) : (
          <button className="btn btn-start" onClick={start}>
            ⬇️ Kiruvchi tarjimani boshlash
          </button>
        )}

        <p className="status">
          {capturing
            ? 'Tinglayapman… video qoʻying yoki suhbatdosh gapirsin — meter harakatlanadi.'
            : 'Oʻchiq'}
        </p>
      </main>

      <main className="panel">
        <SubtitleView stream={stream} />
      </main>

      <main className="panel">
        <MeetingPanel />
      </main>

      <main className="panel">
        <SettingsPanel />
      </main>
    </div>
  )
}

export default App
