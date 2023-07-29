/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_BACKEND_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
