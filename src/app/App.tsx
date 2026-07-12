import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import { ContactDock } from '@/components/layout/ContactDock';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { NotFoundView } from '@/components/layout/NotFoundView';
import { content } from '@/data';
import { ErrorBoundary } from './ErrorBoundary';
import { HomePage } from './HomePage';
import { ScrollManager } from './ScrollManager';

// markdown 렌더러(react-markdown 체인)가 홈 번들에 포함되지 않도록 라우트 단위로 분리
const ProjectDetailPage = lazy(() => import('@/features/projects/ProjectDetailPage'));

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <div className="flex min-h-dvh flex-col">
        <Header />
        <AppRoutes />
        <Footer />
        <ContactDock links={content.profile.links} />
      </div>
      <Analytics />
    </BrowserRouter>
  );
}

function AppRoutes() {
  // 라우트가 바뀌면 ErrorBoundary를 리셋해, 한 번 에러가 난 뒤에도
  // 네비게이션으로 정상 화면으로 빠져나올 수 있게 한다.
  const location = useLocation();
  return (
    <main className="flex-1">
      <ErrorBoundary resetKey={location.pathname}>
        <Suspense
          fallback={
            <div role="status" className="mx-auto max-w-3xl px-6 py-16 text-sm text-zinc-500">
              불러오는 중…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
