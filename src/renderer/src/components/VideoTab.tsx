import { useEffect, useState } from 'react'
import type { SystemAudioState } from '../hooks/useSystemAudio'
import { SubtitleView } from './SubtitleView'

/**
 * Video/kiruvchi tarjima sahifasi: system audio capture boshqaruvi + jonli subtitle.
 */
export function VideoTab({ audio }: { audio: SystemAudioState }): React.JSX.Element {
  const { capturing, level, error, stream, start, stop } = audio
  const [overlayOpen, setOverlayOpen] = useState(false)

  useEffect(() => {
    window.api.isOverlayOpen().then(setOverlayOpen)
  }, [])

  const toggleOverlay = async (): Promise<void> => {
    setOverlayOpen(await window.api.toggleOverlay())
  }

  return (
    <div className="tab-page">
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Kiruvchi tarjima</h2>
            <p className="muted">
              Noutbukdan chiqayotgan har qanday ovoz — YouTube, video, Zoom'dagi suhbatdosh —
              tahlil qilinib, pastda tarjima qilinadi.
            </p>
          </div>
          <div className="card-actions">
            <button
              className={`btn-voice ${overlayOpen ? 'on' : ''}`}
              onClick={toggleOverlay}
              title="Video ustida ko'rinadigan subtitle oynasi"
            >
              {overlayOpen ? '🗗 Overlay yoniq' : '🗗 Overlay'}
            </button>
            {capturing ? (
              <button className="btn btn-stop" onClick={stop}>
                ■ Toʻxtatish
              </button>
            ) : (
              <button className="btn btn-start" onClick={start}>
                ▶ Boshlash
              </button>
            )}
          </div>
        </div>

        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${Math.round(level * 100)}%` }} />
        </div>

        {error && <p className="error">{error}</p>}
      </div>

      <SubtitleView stream={stream} />
    </div>
  )
}
