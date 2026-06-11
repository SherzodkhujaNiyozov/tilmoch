import { useEffect, useRef } from 'react'
import { useStt } from '../hooks/useStt'

const STATUS_LABELS: Record<string, string> = {
  idle: 'Kutilmoqda',
  connecting: 'STT serverga ulanmoqda…',
  ready: 'Tinglayapman 🎧',
  error: 'Xato'
}

export function SubtitleView({ stream }: { stream: MediaStream | null }): React.JSX.Element {
  const { status, error, lines } = useStt(stream)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  return (
    <div className="subtitles">
      <div className="subtitles-header">
        <h2>Subtitle</h2>
        <span className={`stt-status stt-${status}`}>{STATUS_LABELS[status]}</span>
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
            <p key={i} className={`subtitle-line ${i === lines.length - 1 ? 'latest' : ''}`}>
              {line}
            </p>
          ))
        )}
      </div>
    </div>
  )
}
