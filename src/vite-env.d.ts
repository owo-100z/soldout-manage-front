/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 원격 설정을 못 읽었을 때의 기본 백엔드 주소 */
  readonly VITE_API_URL?: string;
  /** 최신 백엔드 주소를 담은 config.json의 위치 */
  readonly VITE_CONFIG_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
