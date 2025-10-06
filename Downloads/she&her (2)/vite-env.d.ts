/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_DEMO_CODES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
