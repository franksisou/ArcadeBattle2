import React, { useState, useEffect, useCallback } from 'react';
import './BackgroundSelector.css';

const BackgroundSelector = ({ inline = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentBg, setCurrentBg] = useState('default');

  const backgrounds = [
    { id: 'default', name: 'Por Defecto', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'sunset', name: 'Atardecer', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'ocean', name: 'Océano', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'forest', name: 'Bosque', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'neon', name: 'Neón', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'dark', name: 'Oscuro', gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }
  ];

  const applyBackground = useCallback((bgId) => {
    const bg = backgrounds.find(b => b.id === bgId);
    if (bg) {
      // Aplicar al body
      document.body.style.background = bg.gradient;
      document.body.style.backgroundAttachment = 'fixed';
      
      // Aplicar a todos los contenedores principales
      const containers = [
        '.dashboard-container',
        '.profile-container',
        '.achievements-container',
        '.snake-game-container',
        '.space-invaders-container',
        '.tetris-container',
        '.pacman-container'
      ];
      
      containers.forEach(selector => {
        const container = document.querySelector(selector);
        if (container) {
          container.style.background = bg.gradient;
          container.style.backgroundAttachment = 'fixed';
        }
      });
    }
  }, [backgrounds]);

  useEffect(() => {
    const saved = localStorage.getItem('background') || 'default';
    setCurrentBg(saved);
    applyBackground(saved);
  }, [applyBackground]);

  const selectBackground = (bgId) => {
    console.log('Seleccionando fondo:', bgId);
    setCurrentBg(bgId);
    localStorage.setItem('background', bgId);
    applyBackground(bgId);
    setIsOpen(false);
  };

  if (inline) {
    return (
      <div className="bg-selector-inline">
        <button className="inline-btn" onClick={() => setIsOpen(!isOpen)} title="Cambiar fondo">
          🎨
        </button>
        
        {isOpen && (
          <div className="bg-selector-panel-inline">
            <h4>Fondos</h4>
            <div className="bg-options-inline">
              {backgrounds.map(bg => (
                <div
                  key={bg.id}
                  className={`bg-option-inline ${currentBg === bg.id ? 'active' : ''}`}
                  style={{ background: bg.gradient }}
                  onClick={() => selectBackground(bg.id)}
                  title={bg.name}
                >
                  {currentBg === bg.id && '✓'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="background-selector">
      <button className="bg-selector-toggle" onClick={() => setIsOpen(!isOpen)}>
        🎨
      </button>
      
      {isOpen && (
        <div className="bg-selector-panel">
          <h4>Selecciona un fondo</h4>
          <div className="bg-options">
            {backgrounds.map(bg => (
              <div
                key={bg.id}
                className={`bg-option ${currentBg === bg.id ? 'active' : ''}`}
                style={{ background: bg.gradient }}
                onClick={() => selectBackground(bg.id)}
                title={bg.name}
              >
                {currentBg === bg.id && '✓'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector;
