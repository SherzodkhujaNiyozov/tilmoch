import { useEffect, useRef, useState } from 'react'

const STT_URL = 'ws://127.0.0.1:8765'

export interface SubtitleLine {
  id: number
  src: string // asl transkripsiya
  dst: string | null // tarjima (null = hali kelmagan)
  dstError: string | null
}

export interface SttState {
  status: 'idle' | 'connecting' | 'ready' | 'error'
  error: string | null
  lines: SubtitleLine[] // oxirgisi eng yangi
}

/**
 * Capture stream'ni 16kHz mono int16 PCM ko'rinishida Python STT serverga
 * oqim qilib yuboradi, kelgan transkripsiyalarni yig'adi va har segmentni
 * darhol tarjimaga (main process -> Ollama/OpenAI) jo'natadi.
 */
export function useStt(stream: MediaStream | null): SttState {
  const [status, setStatus] = useState<SttState['status']>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lines, setLines] = useState<SubtitleLine[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    if (!stream) {
      setStatus('idle')
      return
    }

    let ws: WebSocket | null = null
    let audioCtx: AudioContext | null = null
    let cancelled = false

    const run = async (): Promise<void> => {
      setStatus('connecting')
      setError(null)
      setLines([])

      const settings = await window.api.getSettings()

      ws = new WebSocket(STT_URL)
      ws.binaryType = 'arraybuffer'

      ws.onopen = () => {
        ws!.send(
          JSON.stringify({ model: settings.stt.model, language: settings.sourceLang })
        )
      }

      const translateLine = (id: number, text: string): void => {
        window.api
          .translate(text)
          .then((r) => {
            setLines((prev) =>
              prev.map((l) =>
                l.id === id
                  ? { ...l, dst: r.ok ? r.text : null, dstError: r.ok ? null : (r.error ?? null) }
                  : l
              )
            )
          })
          .catch((err) => {
            setLines((prev) =>
              prev.map((l) => (l.id === id ? { ...l, dstError: String(err) } : l))
            )
          })
      }

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data as string)
        if (msg.type === 'ready') setStatus('ready')
        else if (msg.type === 'final' && msg.text) {
          const line: SubtitleLine = { id: nextId.current++, src: msg.text, dst: null, dstError: null }
          setLines((prev) => [...prev.slice(-19), line])
          translateLine(line.id, line.src)
        } else if (msg.type === 'error') {
          setError(msg.message)
          setStatus('error')
        }
      }

      ws.onerror = () => {
        if (!cancelled) {
          setError('STT serverga ulanib boʻlmadi. python/stt_server.py ishlayaptimi?')
          setStatus('error')
        }
      }

      // 16kHz kontekst — brauzer o'zi resample qiladi.
      // Worklet alohida fayl (public/pcm-worklet.js): CSP blob: skriptlarga ruxsat bermaydi.
      audioCtx = new AudioContext({ sampleRate: 16000 })
      await audioCtx.audioWorklet.addModule('pcm-worklet.js')
      if (cancelled) return

      const source = audioCtx.createMediaStreamSource(stream)
      const node = new AudioWorkletNode(audioCtx, 'pcm')

      // ~1024 sample (64ms) bo'laklab yuboramiz — WS overhead'ini kamaytirish uchun.
      let batch: Float32Array[] = []
      let batchLen = 0
      node.port.onmessage = (e: MessageEvent<Float32Array>) => {
        // TTS o'z tarjimamizni o'qiyotganda oqimni to'xtatamiz —
        // aks holda loopback TTS ovozini qayta ushlab, cheksiz halqa bo'ladi.
        if (ttsPlaying.current) {
          batch = []
          batchLen = 0
          return
        }
        batch.push(e.data)
        batchLen += e.data.length
        if (batchLen >= 1024 && ws && ws.readyState === WebSocket.OPEN) {
          const pcm = new Int16Array(batchLen)
          let off = 0
          for (const f of batch) {
            for (let i = 0; i < f.length; i++) {
              const s = Math.max(-1, Math.min(1, f[i]))
              pcm[off++] = s < 0 ? s * 0x8000 : s * 0x7fff
            }
          }
          ws.send(pcm.buffer)
          batch = []
          batchLen = 0
        }
      }

      source.connect(node)
      node.connect(audioCtx.destination) // worklet ishlashi uchun grafga ulanishi shart; chiqishi yo'q
    }

    run().catch((e) => {
      if (!cancelled) {
        setError(e instanceof Error ? e.message : String(e))
        setStatus('error')
      }
    })

    return () => {
      cancelled = true
      ws?.close()
      audioCtx?.close()
    }
  }, [stream])

  return { status, error, lines }
}
