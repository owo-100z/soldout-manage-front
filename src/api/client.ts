import axios from 'axios';
import { getApiUrl } from './config';

const client = axios.create({
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * 백엔드 주소는 빌드에 굽지 않는다. cloudflared 퀵터널이라 재시작마다 바뀌기 때문에,
 * 요청이 나가기 직전에 window.API_URL의 현재 값을 읽어 붙인다.
 */
client.interceptors.request.use((config) => {
  config.baseURL = getApiUrl();
  return config;
});

/** 백엔드가 { ok:false, error } 로 주는 메시지를 살려서 던진다. */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ??
      (err.code === 'ECONNABORTED'
        ? '요청 시간이 초과되었습니다'
        : err.message || '서버에 연결할 수 없습니다');
    return Promise.reject(new Error(message));
  }
);

export default client;
