import { useCallback, useRef, useState } from 'react'
import { ttsPlaying } from '../lib/ttsGate'

const MAX_QUEUE = 3 // tarjimalar nutqdan tez kelsa, eskilarini tashlab yuboramiz

export interface TtsQueue {
  speaking: boolean
  enqueue: (text: string) => void
  clear: () => void
}

/**
 * Tarjimalarni navbat bilan ovozda o'qiydi (edge-tts orqali).
 * Bir vaqtda bitta audio ijro etiladi; ijro paytida ttsGate bayrog'i
 * STT oqimini to'xtatib turadi (feedback loop oldini olish).
 */
export function useTtsQueue(): TtsQueue {
  const queue = useRef<string[]>([])
  const playing = useRef(false)
  const [speaking, setSpeaking] = useState(false)

  const playNext = useCallback(async (): Promise<void> => {
    if (playing.current) return
    const text = queue.current.shift()
    if (!text) {
      setSpeaking(false)
      ttsPlaying.current = false
      return
    }
    playing.current = true
    setSpeaking(true)
    ttsPlaying.current = true
    try {
      const settings = await window.api.getSettings()
      if (settings.tts.provider === 'edge-tts' && settings.tts.model) {
        const bytes = await window.api.speak(text, settings.tts.model)
        await new Promise<void>((resolve) => {
          const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'audio/mpeg' })
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          const done = (): void => {
            URL.revokeObjectURL(url)
            resolve()
          }
          audio.onended = done
          audio.onerror = done
          audio.play().catch(done)
        })
      }
    } catch {
      // bitta segment xatosi navbatni to'xtatmasin
    } finally {
      playing.current = false
      void playNext()
    }
  }, [])

  const enqueue = useCallback(
    (text: string): void => {
      if (!text.trim()) return
      queue.current.push(text)
      while (queue.current.length > MAX_QUEUE) queue.current.shift()
      void playNext()
    },
    [playNext]
  )

  const clear = useCallback((): void => {
    queue.current = []
  }, [])

  return { speaking, enqueue, clear }
}
