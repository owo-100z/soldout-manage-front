// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function initApp() {
  try {
    const gistUrl = 'https://gist.githubusercontent.com/owo-100z/1556b55396916aeb06571471049c1cb4/raw/config.json';
    const cacheBuster = `?v=${Date.now()}`;

    const response = await fetch(`${gistUrl}${cacheBuster}`, { cache: 'no-store' });
    const config = await response.json();
    
    // 🌟 다른 파일에서 import 안 해도 언제든 꺼내 쓸 수 있게 window에 박아버립니다!
    (window as any).API_URL = config.API_URL;
    console.log("🔥 전역에 등록된 API 주소:", (window as any).API_URL);
  } catch (error) {
    console.error("Gist 로드 실패, 기본 주소로 대체합니다.", error);
    (window as any).API_URL = "http://localhost:3000"; 
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

initApp();