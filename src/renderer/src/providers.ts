// Har bir pipeline bosqichi uchun tanlanadigan provider'lar roʻyxati.
// dynamicModels: model roʻyxati runtime'da olinadi (Ollama / Edge TTS ovozlari).

export interface ProviderDef {
  id: string
  label: string
  free: boolean
  needsApiKey: boolean
  needsEndpoint?: boolean
  models?: string[]
  dynamicModels?: 'ollama' | 'edge-voices'
}

export const STT_PROVIDERS: ProviderDef[] = [
  {
    id: 'whisper-local',
    label: 'Whisper (lokal, bepul)',
    free: true,
    needsApiKey: false,
    models: ['tiny', 'base', 'small', 'medium', 'large-v3']
  },
  {
    id: 'openai',
    label: 'OpenAI API',
    free: false,
    needsApiKey: true,
    models: ['whisper-1', 'gpt-4o-mini-transcribe', 'gpt-4o-transcribe']
  },
  {
    id: 'deepgram',
    label: 'Deepgram API',
    free: false,
    needsApiKey: true,
    models: ['nova-3', 'nova-2']
  }
]

export const TRANSLATE_PROVIDERS: ProviderDef[] = [
  {
    id: 'ollama',
    label: 'Ollama (lokal, bepul)',
    free: true,
    needsApiKey: false,
    needsEndpoint: true,
    dynamicModels: 'ollama'
  },
  {
    id: 'openai',
    label: 'OpenAI API',
    free: false,
    needsApiKey: true,
    models: ['gpt-4o-mini', 'gpt-4o']
  },
  {
    id: 'google',
    label: 'Google Translate API',
    free: false,
    needsApiKey: true,
    models: ['nmt']
  }
]

export const TTS_PROVIDERS: ProviderDef[] = [
  {
    id: 'edge-tts',
    label: 'Edge TTS (bepul)',
    free: true,
    needsApiKey: false,
    dynamicModels: 'edge-voices'
  },
  {
    id: 'elevenlabs',
    label: 'ElevenLabs API',
    free: false,
    needsApiKey: true,
    models: ['eleven_flash_v2_5', 'eleven_multilingual_v2']
  }
]

export const LANGUAGES: { code: string; label: string }[] = [
  { code: 'auto', label: 'Avto-aniqlash' },
  { code: 'uz', label: 'Oʻzbek' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語 (Yapon)' },
  { code: 'ru', label: 'Русский' },
  { code: 'ko', label: '한국어 (Koreys)' },
  { code: 'zh', label: '中文 (Xitoy)' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية (Arab)' }
]
