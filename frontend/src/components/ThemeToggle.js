import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ inline = false }) => {
  const { theme, toggleTheme } = useTheme();

  if (inline) {
    return (
      <button 
        onClick={toggleTheme} 
        className="inline-btn theme-btn"
        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    );
  }

  return (
    <button className="theme-toggle" onClick={toggleTheme} title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
