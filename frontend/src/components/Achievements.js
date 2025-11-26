import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import achievementService from '../services/achievementService';
import authService from '../services/authService';
import ThemeToggle from './ThemeToggle';
import './Achievements.css';

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isGuest = currentUser?.isGuest;

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (isGuest) {
      setLoading(false);
      return;
    }

    loadAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await achievementService.getUserAchievements();
      setAchievements(data.achievements);
      setStats(data.stats);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar los logros');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#9e9e9e';
      case 'rare':
        return '#2196f3';
      case 'epic':
        return '#9c27b0';
      case 'legendary':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'games':
        return '🎮';
      case 'score':
        return '🏆';
      case 'skill':
        return '⭐';
      case 'special':
        return '💎';
      default:
        return '🎯';
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="achievements-container">
        <ThemeToggle />
        <div className="loading">Cargando logros...</div>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="achievements-container">
        <ThemeToggle />
        <div className="achievements-header">
          <h1>🏆 Logros</h1>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            Volver al Dashboard
          </button>
        </div>
        <div className="guest-message">
          <h2>Inicia sesión para desbloquear logros</h2>
          <p>Los logros se obtienen al jugar y alcanzar diferentes hitos.</p>
          <button onClick={() => navigate('/register')} className="btn-register">
            Crear Cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      <ThemeToggle />
      
      <div className="achievements-header">
        <h1>🏆 Logros de {currentUser?.username}</h1>
        <div className="header-buttons">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            Dashboard
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="achievements-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.unlocked || 0}</div>
          <div className="stat-label">Desbloqueados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalPoints || 0}</div>
          <div className="stat-label">Puntos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0}%
          </div>
          <div className="stat-label">Progreso</div>
        </div>
      </div>

      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            style={{
              borderColor: achievement.unlocked ? getRarityColor(achievement.rarity) : '#424242'
            }}
          >
            <div className="achievement-icon">
              {achievement.unlocked ? achievement.icon : '🔒'}
            </div>
            <div className="achievement-info">
              <div className="achievement-name">
                {achievement.name}
              </div>
              <div className="achievement-description">
                {achievement.description}
              </div>
              <div className="achievement-meta">
                <span className="achievement-category">
                  {getCategoryIcon(achievement.category)} {achievement.category}
                </span>
                <span 
                  className="achievement-rarity"
                  style={{ color: getRarityColor(achievement.rarity) }}
                >
                  {achievement.rarity}
                </span>
                <span className="achievement-points">
                  {achievement.points} pts
                </span>
              </div>
              {achievement.unlocked && achievement.unlocked_at && (
                <div className="achievement-unlocked-date">
                  Desbloqueado: {new Date(achievement.unlocked_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
