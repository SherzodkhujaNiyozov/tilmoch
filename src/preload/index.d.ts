import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      enableLoopbackAudio: () => Promise<void>
      disableLoopbackAudio: () => Promise<void>
    }
  }
}
