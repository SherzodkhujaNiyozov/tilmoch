import { useCallback, useEffect, useState } from 'react'
import type { AppSettings, StageConfig } from '../../../shared/settings'
import {
  LANGUAGES,
  ProviderDef,
  STT_PROVIDERS,
  TRANSLATE_PROVIDERS,
  TTS_PROVIDERS
} from '../providers'

type StageKey = 'stt' | 'translate' | 'tts'

interface StageSectionProps {
  title: string
  stage: StageKey
  config: StageConfig
  providers: ProviderDef[]
  dynamicModels: string[]
  dynamicError: string | null
  onChange: (stage: StageKey, config: StageConfig) => void
  onRefresh?: () => void
}

function StageSection({
  title,
  stage,
  config,
  providers,
  dynamicModels,
  dynamicError,
  onChange,
  onRefresh
}: StageSectionProps): React.JSX.Element {
  const provider = providers.find((p) => p.id === config.provider) ?? providers[0]
  const models = provider.dynamicModels ? dynamicModels : (provider.models ?? [])

  const set = (patch: Partial<StageConfig>): void => onChange(stage, { ...config, ...patch })

  return (
    <div className="stage">
      <h3>{title}</h3>
      <div className="stage-row">
        <label>Provider</label>
        <select
          value={config.provider}
          onChange={(e) => {
            const next = providers.find((p) => p.id === e.target.value)!
            set({
              provider: next.id,
              model: next.dynamicModels ? '' : (next.models?.[0] ?? ''),
              endpoint: next.id === 'ollama' ? config.endpoint || 'http://localhost:11434' : ''
            })
          }}
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="stage-row">
        <label>Model</label>
        <div className="model-select">
          {models.length > 0 ? (
            <select value={config.model} onChange={(e) => set({ model: e.target.value })}>
              {!models.includes(config.model) && config.model && (
                <option value={config.model}>{config.model} (oʻrnatilmagan!)</option>
              )}
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <select disabled>
              <option>{provider.dynamicModels ? 'Modellar topilmadi' : 'Model yoʻq'}</option>
            </select>
          )}
          {provider.dynamicModels && onRefresh && (
            <button className="btn-refresh" title="Roʻyxatni yangilash" onClick={onRefresh}>
              ↻
            </button>
          )}
        </div>
      </div>

      {dynamicError && <p className="stage-error">{dynamicError}</p>}

      {provider.needsEndpoint && (
        <div className="stage-row">
          <label>Endpoint</label>
          <input
            type="text"
            value={config.endpoint}
            placeholder="http://localhost:11434"
            onChange={(e) => set({ endpoint: e.target.value })}
          />
        </div>
      )}

      {provider.needsApiKey && (
        <div className="stage-row">
          <label>API key</label>
          <input
            type="password"
            value={config.apiKey}
            placeholder="sk-..."
            onChange={(e) => set({ apiKey: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}

export function SettingsPanel(): React.JSX.Element {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [ollamaModels, setOllamaModels] = useState<string[]>([])
  const [ollamaError, setOllamaError] = useState<string | null>(null)
  const [voices, setVoices] = useState<string[]>([])
  const [voicesError, setVoicesError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    window.api.getSettings().then(setSettings)
  }, [])

  // Ollama modellarini olish (translate provider ollama boʻlsa).
  // Roʻyxat kelganda joriy model roʻyxatda boʻlmasa, birinchisini avtomatik tanlaymiz —
  // foydalanuvchi hech qachon model nomini qoʻlda yozmaydi.
  const ollamaEndpoint =
    settings?.translate.provider === 'ollama' ? settings.translate.endpoint : null
  const refreshOllama = useCallback(() => {
    if (!ollamaEndpoint) return
    window.api.listOllamaModels(ollamaEndpoint).then((r) => {
      setOllamaModels(r.models)
      setOllamaError(
        r.ok
          ? r.models.length === 0
            ? 'Ollama ishlayapti, lekin model oʻrnatilmagan. Masalan: ollama pull gemma3'
            : null
          : `Ollama topilmadi (${ollamaEndpoint}). Ollama oʻrnatilganmi va ishlayaptimi?`
      )
      if (r.ok && r.models.length > 0) {
        setSettings((s) => {
          if (!s || s.translate.provider !== 'ollama' || r.models.includes(s.translate.model))
            return s
          return { ...s, translate: { ...s.translate, model: r.models[0] } }
        })
      }
    })
  }, [ollamaEndpoint])
  useEffect(refreshOllama, [refreshOllama])

  // Edge TTS ovozlari — maqsad tilga mos filtrlash
  const targetLang = settings?.targetLang
  const ttsProvider = settings?.tts.provider
  const refreshVoices = useCallback(() => {
    if (ttsProvider !== 'edge-tts' || !targetLang) return
    window.api
      .listTtsVoices()
      .then((all) => {
        const filtered = all
          .filter((v) => v.locale.toLowerCase().startsWith(targetLang))
          .map((v) => v.name)
        const list = filtered.length > 0 ? filtered : all.map((v) => v.name)
        setVoices(list)
        setVoicesError(null)
        if (list.length > 0) {
          setSettings((s) => {
            if (!s || s.tts.provider !== 'edge-tts' || list.includes(s.tts.model)) return s
            return { ...s, tts: { ...s.tts, model: list[0] } }
          })
        }
      })
      .catch(() => setVoicesError('Edge TTS ovozlarini olib boʻlmadi (internet kerak).'))
  }, [ttsProvider, targetLang])
  useEffect(refreshVoices, [refreshVoices])

  const updateStage = useCallback((stage: StageKey, config: StageConfig) => {
    setSettings((s) => (s ? { ...s, [stage]: config } : s))
    setSaved(false)
  }, [])

  if (!settings) return <p className="status">Sozlamalar yuklanmoqda…</p>

  const save = async (): Promise<void> => {
    await window.api.saveSettings(settings)
    setSaved(true)
  }

  const testTts = async (): Promise<void> => {
    if (!settings.tts.model) return
    setTesting(true)
    try {
      const bytes = await window.api.speak(
        'Salom! Tilmoch ishlayapti. こんにちは、ティルモチです。',
        settings.tts.model
      )
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => URL.revokeObjectURL(url)
      await audio.play()
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="settings">
      <h2>Sozlamalar</h2>

      <div className="stage">
        <h3>Tillar</h3>
        <div className="stage-row">
          <label>Manba til</label>
          <select
            value={settings.sourceLang}
            onChange={(e) => {
              setSettings({ ...settings, sourceLang: e.target.value })
              setSaved(false)
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div className="stage-row">
          <label>Maqsad til</label>
          <select
            value={settings.targetLang}
            onChange={(e) => {
              setSettings({ ...settings, targetLang: e.target.value })
              setSaved(false)
            }}
          >
            {LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <StageSection
        title="1. Ovoz → Matn (STT)"
        stage="stt"
        config={settings.stt}
        providers={STT_PROVIDERS}
        dynamicModels={[]}
        dynamicError={null}
        onChange={updateStage}
      />

      <StageSection
        title="2. Tarjima"
        stage="translate"
        config={settings.translate}
        providers={TRANSLATE_PROVIDERS}
        dynamicModels={ollamaModels}
        dynamicError={ollamaError}
        onChange={updateStage}
        onRefresh={refreshOllama}
      />

      <StageSection
        title="3. Matn → Ovoz (TTS)"
        stage="tts"
        config={settings.tts}
        providers={TTS_PROVIDERS}
        dynamicModels={voices}
        dynamicError={voicesError}
        onChange={updateStage}
        onRefresh={refreshVoices}
      />

      <div className="settings-actions">
        <button className="btn btn-start" onClick={save}>
          Saqlash
        </button>
        <button
          className="btn btn-secondary"
          onClick={testTts}
          disabled={testing || settings.tts.provider !== 'edge-tts' || !settings.tts.model}
        >
          {testing ? 'Oʻqilmoqda…' : 'TTS sinash 🔊'}
        </button>
        {saved && <span className="saved-badge">✓ Saqlandi</span>}
      </div>
    </div>
  )
}
