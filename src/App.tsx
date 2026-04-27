import { useLayoutEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import './App.module.css';
import HeaderContainer from './containers/HeaderContainer/HeaderContainer';
import Home from './pages/Home/Home';
import FooterContainer from './containers/FooterContainer/FooterContainer';
import PostDetail from './pages/PostDetail/PostDetail';
import styles from './App.module.css';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import Projects from './pages/Projects/Projects';
import Posts from './pages/Posts/Posts';
import GuestBook from './pages/GuestBook/GuestBook';
import GuestBookForm from './pages/GuestBookForm/GuestBookForm';
import NotFound from './pages/NotFound/NotFound';
import LangLayout from './i18n/LangLayout';
import { useAutoLanguageRedirect } from './i18n/useAutoLanguageRedirect';

const appRoutes = (
  <>
    <Route index element={<Home />} />
    <Route path="projects" element={<Projects />} />
    <Route path="projects/:slug" element={<ProjectDetail />} />
    <Route path="posts" element={<Posts />} />
    <Route path="posts/:slug" element={<PostDetail />} />
    <Route path="guestbook" element={<GuestBook />} />
    <Route path="guestbook/write" element={<GuestBookForm />} />
    <Route path="*" element={<NotFound />} />
  </>
);

const AppContent = () => {
  useAutoLanguageRedirect();
  const { pathname } = useLocation();

  // 라우트 이동 시 새 페이지의 최상단부터 보이도록 함.
  // 단, 홈으로 돌아가는 경우엔 Home 컴포넌트의 useLayoutEffect가 저장된 스크롤을 복원해야 하므로 스킵.
  useLayoutEffect(() => {
    const isHome = pathname === "/" || pathname === "/jp";
    if (!isHome) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <>
      <HeaderContainer />
      <Routes>
        <Route path="/jp" element={<LangLayout lang="jp" />}>
          {appRoutes}
        </Route>
        <Route path="/" element={<LangLayout lang="ko" />}>
          {appRoutes}
        </Route>
      </Routes>
      <FooterContainer />
    </>
  );
};

function App() {
  return (
    <div className={styles.app}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Analytics />
    </div>
  )
}

export default App;
