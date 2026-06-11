import axios from 'axios';

const client = axios.create({
  // 🌟 처음엔 비워두거나 기본값을 적어줍니다.
  baseURL: 'http://localhost:3000', 
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🌟 핵심: API 요청이 출발하기 직전에 인터셉터가 가로채서 최신 주소를 바인딩합니다.
client.interceptors.request.use((config) => {
  const currentApiUrl = (window as any).API_URL;
  
  if (currentApiUrl) {
    config.baseURL = currentApiUrl;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default client;