import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingActionBar.css';

const FloatingActionBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const playRandomGame = () => {
    const games = ['snake', 'space-invaders', 'tetris', 'pacman'];
    const randomGame = games[Math.floor(Math.random() * games.length)];
    navigate(`/games/${randomGame}`);
  };

  return (
    <div className={`floating-action-bar ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="fab-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '✕' : '☰'}
      </button>
      
      {isExpanded && (
        <div className="fab-actions">
          <button className="fab-btn" onClick={playRandomGame} title="Juego Aleatorio">
            🎲
          </button>
          <button className="fab-btn" onClick={() => navigate('/achievements')} title="Logros">
            🏆
          </button>
          <button className="fab-btn" onClick={() => navigate('/profile')} title="Perfil">
            👤
          </button>
          <button className="fab-btn" onClick={() => navigate('/dashboard')} title="Dashboard">
            🏠
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingActionBar;
