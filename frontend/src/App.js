// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Componentes
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Achievements from './components/Achievements';

// Juegos
import Snake from './components/games/Snake';
import SpaceInvaders from './components/games/SpaceInvaders';
import Tetris from './components/games/Tetris';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/games/snake" element={<Snake />} />
          <Route path="/games/space-invaders" element={<SpaceInvaders />} />
          <Route path="/games/tetris" element={<Tetris />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;