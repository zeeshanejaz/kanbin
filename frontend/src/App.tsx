import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import BoardView from './pages/Board';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* / is served as a static HTML page by Nginx (AI/scraper friendly).
            Client-side navigation to / (e.g. clicking the brand logo from a board)
            redirects to /home which shows the lightweight SPA home page. */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/b/:key"
          element={
            <div className="board-shell">
              <header className="board-nav">
                <div className="board-nav-inner">
                  <Link to="/" className="board-brand">kanbin<span className="brand-accent">_</span></Link>
                </div>
              </header>
              <main className="board-main">
                <BoardView />
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
