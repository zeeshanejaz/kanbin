import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import BoardView from './pages/Board';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
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
