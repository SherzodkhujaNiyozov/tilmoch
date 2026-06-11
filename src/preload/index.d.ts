import { ElectronAPI } from '@electron-toolkit/preload'
import type { AppSettings } from '../shared/settings'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      enableLoopbackAudio: () => Promise<void>
      disableLoopbackAudio: () => Promise<void>
      getSettings: () => Promise<AppSettings>
      saveSettings: (settings: AppSettings) => Promise<void>
      listOllamaModels: (
        endpoint: string
      ) => Promise<{ ok: boolean; models: string[]; error?: string }>
      listTtsVoices: () => Promise<{ name: string; locale: string; gender: string }[]>
      speak: (text: string, voice: string) => Promise<Uint8Array>
    }
  }
}
