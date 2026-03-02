import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.module.css';
import HeaderContainer from './containers/HeaderContainer/HeaderContainer';
import Home from './pages/Home/Home';
import FooterContainer from './containers/FooterContainer/FooterContainer';
import PostDetail from './pages/PostDetail/PostDetail';
import styles from './App.module.css';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';

function App() {
  return (
    <div className={styles.app}>
      <BrowserRouter>
        <HeaderContainer />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/project/:slug" element={<ProjectDetail />} />
        </Routes>
        <FooterContainer />
      </BrowserRouter>
    </div>
  )
}

export default App;
