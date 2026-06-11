export interface StageConfig {
  provider: string
  model: string
  apiKey: string
  endpoint: string
}

export interface AppSettings {
  sourceLang: string // 'auto' yoki BCP-47 prefiksi: 'en', 'ja', ...
  targetLang: string
  stt: StageConfig
  translate: StageConfig
  tts: StageConfig
}

export const DEFAULT_SETTINGS: AppSettings = {
  sourceLang: 'auto',
  targetLang: 'uz',
  stt: {
    provider: 'whisper-local',
    model: 'large-v3-turbo',
    apiKey: '',
    endpoint: ''
  },
  translate: {
    provider: 'ollama',
    model: 'gemma2',
    apiKey: '',
    endpoint: 'http://localhost:11434'
  },
  tts: {
    provider: 'edge-tts',
    model: 'uz-UZ-MadinaNeural',
    apiKey: '',
    endpoint: ''
  }
}
