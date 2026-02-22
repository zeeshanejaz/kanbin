import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
            <div className="app-container">
              <header className="app-header">
                <div className="logo">Kanbin</div>
                <div className="tagline">Ephemeral Key-Based Boards</div>
              </header>
              <main className="app-main">
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
