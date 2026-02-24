import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BoardView from './pages/Board';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/b/:key"
          element={
            <div className="board-shell">
              <header className="board-nav">
                <div className="board-nav-inner">
                  <a href="/" className="board-brand">kanbin<span className="brand-accent">_</span></a>
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
