import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme} title={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}>
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
