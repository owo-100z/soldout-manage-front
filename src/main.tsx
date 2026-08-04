import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { loadApiUrl } from './api/config';

const root = document.getElementById('root');
if (!root) throw new Error('#root 엘리먼트를 찾지 못했습니다');

// 마운트 즉시 API 요청이 나가므로, 주소를 심은 뒤에 렌더링해야 한다
loadApiUrl().then(() => {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
