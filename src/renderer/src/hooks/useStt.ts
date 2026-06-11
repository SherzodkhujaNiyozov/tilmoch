import { useEffect, useState } from 'react'

const STT_URL = 'ws://127.0.0.1:8765'

export interface SttState {
  status: 'idle' | 'connecting' | 'ready' | 'error'
  error: string | null
  lines: string[] // final transkripsiya qatorlari (oxirgisi eng yangi)
}

/**
 * Capture stream'ni 16kHz mono int16 PCM ko'rinishida Python STT serverga
 * oqim qilib yuboradi va kelgan transkripsiyalarni yig'adi.
 */
export function useStt(stream: MediaStream | null): SttState {
  const [status, setStatus] = useState<SttState['status']>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lines, setLines] = useState<string[]>([])

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

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data as string)
        if (msg.type === 'ready') setStatus('ready')
        else if (msg.type === 'final' && msg.text) {
          setLines((prev) => [...prev.slice(-19), msg.text])
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
