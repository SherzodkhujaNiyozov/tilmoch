import { useEffect, useState } from 'react'

interface OverlayLine {
  id: number
  src: string
  dst: string | null
}

/**
 * Shaffof, har doim tepada turadigan subtitle oynasi.
 * Asosiy oynadan IPC orqali kelgan oxirgi tarjimani ko'rsatadi.
 */
export function Overlay(): React.JSX.Element {
  const [line, setLine] = useState<OverlayLine | null>(null)

  useEffect(() => {
    document.body.classList.add('overlay-mode')
    window.api.onOverlayLine((l) => {
      setLine((prev) => {
        // Bir xil id keldi = tarjima yangilandi; yangi id = yangi gap
        if (prev && l.id < prev.id) return prev
        return l
      })
    })
  }, [])

  return (
    <div className="overlay-root">
      <button className="overlay-close" onClick={() => window.api.closeOverlay()} title="Yopish">
        ✕
      </button>
      {line ? (
        <div className="overlay-content">
          <p className="overlay-src">{line.src}</p>
          <p className="overlay-dst">{line.dst ?? '…'}</p>
        </div>
      ) : (
        <div className="overlay-content">
          <p className="overlay-waiting">Tilmoch — tarjima shu yerda chiqadi</p>
        </div>
      )}
    </div>
  )
}
