/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRACKING_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
