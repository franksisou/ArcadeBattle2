// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Componentes
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Achievements from './components/Achievements';
import BackgroundMusic from './components/BackgroundMusic';

// Juegos
import Snake from './components/games/Snake';
import SpaceInvaders from './components/games/SpaceInvaders';
import Tetris from './components/games/Tetris';
import Pacman from './components/games/Pacman';

function App() {
  useEffect(() => {
    // Aplicar el fondo guardado al cargar la aplicación
    const backgrounds = {
      'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'sunset': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'ocean': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'forest': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'neon': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'dark': 'linear-gradient(135deg, #232526 0%, #414345 100%)'
    };
    
    const savedBg = localStorage.getItem('background') || 'default';
    const gradient = backgrounds[savedBg] || backgrounds['default'];
    
    document.body.style.background = gradient;
    document.body.style.backgroundAttachment = 'fixed';
  }, []);

  return (
    <Router>
      <div className="App">
        <BackgroundMusic />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/games/snake" element={<Snake />} />
          <Route path="/games/space-invaders" element={<SpaceInvaders />} />
          <Route path="/games/tetris" element={<Tetris />} />
          <Route path="/games/pacman" element={<Pacman />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;