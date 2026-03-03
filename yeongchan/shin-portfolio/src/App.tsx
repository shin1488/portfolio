import { BrowserRouter, Route, Routes } from 'react-router-dom';
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

function App() {
  return (
    <div className={styles.app}>
      <BrowserRouter>
        <HeaderContainer />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/projects' element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path='/posts' element={<Posts />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
          <Route path="/guestbook" element={<GuestBook />} />
          <Route path="/guestbook/write" element={<GuestBookForm />} />
        </Routes>
        <FooterContainer />
      </BrowserRouter>
    </div>
  )
}

export default App;
