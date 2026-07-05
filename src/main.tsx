import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import './index.css';

// 재배포 후 stale 클라이언트가 사라진 해시 청크를 요청하면 새 index.html로 복구한다.
// sessionStorage 가드로 무한 리로드를 막고, 재시도 실패 시 ErrorBoundary가 받는다.
window.addEventListener('vite:preloadError', (event) => {
  const reloadedKey = 'chunk-reload';
  if (!sessionStorage.getItem(reloadedKey)) {
    sessionStorage.setItem(reloadedKey, '1');
    event.preventDefault();
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
