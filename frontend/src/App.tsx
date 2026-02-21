import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BoardView from './pages/Board';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <div className="logo">Kanbin</div>
          <div className="tagline">Ephemeral Key-Based Boards</div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/b/:key" element={<BoardView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
