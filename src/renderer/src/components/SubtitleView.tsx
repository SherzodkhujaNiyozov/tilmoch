import { useEffect, useRef, useState } from 'react'
import { useStt } from '../hooks/useStt'
import { useTtsQueue } from '../hooks/useTtsQueue'

const STATUS_LABELS: Record<string, string> = {
  idle: 'Kutilmoqda',
  connecting: 'STT serverga ulanmoqda…',
  ready: 'Tinglayapman 🎧',
  error: 'Xato'
}

export function SubtitleView({ stream }: { stream: MediaStream | null }): React.JSX.Element {
  const { status, error, lines } = useStt(stream)
  const { speaking, enqueue, clear } = useTtsQueue()
  const [voiceOn, setVoiceOn] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastSpokenId = useRef(-1)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  // Yangi kelgan tarjimalarni ovozga qo'yamiz
  useEffect(() => {
    if (!voiceOn) return
    for (const l of lines) {
      if (l.dst && l.id > lastSpokenId.current) {
        lastSpokenId.current = l.id
        enqueue(l.dst)
      }
    }
  }, [lines, voiceOn, enqueue])

  const toggleVoice = (): void => {
    if (voiceOn) clear()
    setVoiceOn(!voiceOn)
  }

  return (
    <div className="subtitles">
      <div className="subtitles-header">
        <h2>Subtitle</h2>
        <div className="subtitles-controls">
          <button
            className={`btn-voice ${voiceOn ? 'on' : ''}`}
            onClick={toggleVoice}
            title={voiceOn ? 'Ovozli tarjimani oʻchirish' : 'Ovozli tarjimani yoqish'}
          >
            {voiceOn ? (speaking ? '🔊 Gapiryapman…' : '🔊 Ovoz yoniq') : '🔇 Ovoz oʻchiq'}
          </button>
          <span className={`stt-status stt-${status}`}>{STATUS_LABELS[status]}</span>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="subtitle-box" ref={scrollRef}>
        {lines.length === 0 ? (
          <p className="subtitle-empty">
            {status === 'ready'
              ? 'Video yoki audio qoʻying — gap tugagach matn shu yerda chiqadi.'
              : 'Capture boshlanganda subtitle shu yerda koʻrinadi.'}
          </p>
        ) : (
          lines.map((line, i) => (
            <div key={line.id} className={`subtitle-pair ${i === lines.length - 1 ? 'latest' : ''}`}>
              <p className="subtitle-src">{line.src}</p>
              {line.dst !== null ? (
                <p className="subtitle-dst">{line.dst}</p>
              ) : line.dstError ? (
                <p className="subtitle-dst-error">tarjima xatosi: {line.dstError}</p>
              ) : (
                <p className="subtitle-dst pending">tarjima qilinmoqda…</p>
              )}
            </div>
          ))
        )}
      </div>

      {voiceOn && (
        <p className="hint">
          ⚠️ Ovozli tarjima paytida asl audio tinglanmaydi (aks-sado halqasining oldini olish
          uchun). Video tarjimada subtitle rejimi qulayroq.
        </p>
      )}
    </div>
  )
}
