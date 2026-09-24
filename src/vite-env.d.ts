/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_STELLAR_NETWORK?: string
  readonly VITE_APP_URL?: string
  readonly VITE_FF_MESSAGING?: string
  readonly VITE_FF_NOTIFICATIONS?: string
  readonly VITE_FF_ADVANCED_FILTERS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
