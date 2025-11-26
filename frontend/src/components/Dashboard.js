import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import scoreService from '../services/scoreService';
import ThemeToggle from './ThemeToggle';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      navigate('/');
      return;
    }

    // Obtener información del usuario
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Si es invitado, no cargar estadísticas
    if (currentUser?.isGuest) {
      setLoading(false);
      return;
    }

    // Cargar estadísticas y leaderboard
    const loadData = async () => {
      try {
        const [userStats, globalLeaderboard] = await Promise.all([
          scoreService.getUserStats(),
          scoreService.getGlobalLeaderboard(10)
        ]);
        
        setStats(userStats);
        setLeaderboard(globalLeaderboard);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (!user || loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎮 ArcadeBattle</h1>
          <div className="user-info">
            <span className="username">👤 {user.username} {user.isGuest && '(Invitado)'}</span>
            {!user.isGuest && (
              <>
                <button onClick={() => navigate('/achievements')} className="btn-achievements">
                  🏆 Logros
                </button>
                <button onClick={() => navigate('/profile')} className="btn-profile">
                  Mi Perfil
                </button>
              </>
            )}
            <button onClick={handleLogout} className="btn-logout">
              {user.isGuest ? 'Salir' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {user.isGuest && (
          <div className="guest-banner">
            <p>📢 Estás jugando como invitado. <strong>Las puntuaciones no se guardarán.</strong></p>
            <button onClick={() => navigate('/')} className="btn-register-prompt">
              Crear cuenta para guardar progreso
            </button>
          </div>
        )}

        <section className="welcome-section">
          <h2>¡Bienvenido, {user.username}! 🎉</h2>
          <p>{user.isGuest ? '¡Disfruta de los juegos! Crea una cuenta para guardar tu progreso.' : 'Estás listo para competir en el arcade más emocionante'}</p>
        </section>

        {!user.isGuest && (
          <section className="stats-section">
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <h3>Puntuación Total</h3>
              <p className="stat-number">{stats?.total_score || 0}</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚔️</div>
              <h3>Partidas</h3>
              <p className="stat-number">{stats?.total_games || 0}</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <h3>Ranking</h3>
              <p className="stat-number">#{stats?.rank || '-'}</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <h3>Mejor Score</h3>
              <p className="stat-number">{stats?.best_score || 0}</p>
            </div>
          </section>
        )}

        <section className="games-section">
          <h2>Juegos Disponibles</h2>
          <div className="games-grid">
            <div className="game-card">
              <div className="game-icon">🐍</div>
              <h3>Snake Battle</h3>
              <p>Clásico juego de serpiente - ¡Come y crece!</p>
              <button className="btn-play" onClick={() => navigate('/games/snake')}>
                ▶ Jugar Ahora
              </button>
            </div>

            <div className="game-card">
              <div className="game-icon">👾</div>
              <h3>Space Invaders</h3>
              <p>Defiende la Tierra de la invasión alienígena</p>
              <button className="btn-play" onClick={() => navigate('/games/space-invaders')}>
                ▶ Jugar Ahora
              </button>
            </div>

            <div className="game-card">
              <div className="game-icon">🎲</div>
              <h3>Tetris</h3>
              <p>Apila bloques y completa líneas</p>
              <button className="btn-play" onClick={() => navigate('/games/tetris')}>
                ▶ Jugar Ahora
              </button>
            </div>

            <div className="game-card">
              <div className="game-icon">🏓</div>
              <h3>Pong Battle</h3>
              <p>Desafía a otros jugadores en tiempo real</p>
              <button className="btn-play" disabled>Próximamente</button>
            </div>
          </div>
        </section>

        {!user.isGuest && (
          <section className="leaderboard-section">
            <h2>🏅 Tabla de Clasificación Global</h2>
            <div className="leaderboard">
              {leaderboard.length > 0 ? (
                leaderboard.map((player, index) => (
                  <div 
                    key={player.user_id} 
                    className={`leaderboard-item ${player.user_id === user.id ? 'current-user' : ''}`}
                  >
                    <span className={`rank rank-${index + 1}`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </span>
                    <span className="player-name">
                      {player.username}
                      {player.user_id === user.id && <span className="you-badge"> (Tú)</span>}
                    </span>
                    <div className="player-stats">
                      <span className="games-played">{player.games_played} juegos</span>
                      <span className="points">{player.total_score.toLocaleString()} pts</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">¡Sé el primero en jugar y aparecer en el ranking!</p>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="dashboard-footer">
        <p>&copy; 2025 ArcadeBattle. Todos los derechos reservados.</p>
      </footer>

      <ThemeToggle />
    </div>
  );
};

export default Dashboard;
