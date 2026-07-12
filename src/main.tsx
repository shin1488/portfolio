import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import { readDebugFlags } from '@/lib/debugFlags';
import { installRouteTransition } from '@/lib/viewTransition';
import './index.css';

// 실기기 원인 추적용 임시 스위치(?vt=off 등) — 다른 코드가 읽기 전에 먼저 새긴다.
readDebugFlags();

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

// 뒤로/앞으로가기도 크로스페이드로 넘긴다. react-router보다 먼저 등록해야 '이전 화면' 스냅샷을
// 제때 찍을 수 있어(popstate 리스너는 등록 순서대로 실행) 마운트 전에 호출한다.
installRouteTransition();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
