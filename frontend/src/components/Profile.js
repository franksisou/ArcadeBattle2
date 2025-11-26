import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import scoreService from '../services/scoreService';
import ThemeToggle from './ThemeToggle';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [userScores, setUserScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        navigate('/');
        return;
      }

      setUser(currentUser);
      setEditForm({
        username: currentUser.username,
        email: currentUser.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      const [statsData, scoresData] = await Promise.all([
        scoreService.getUserStats(),
        scoreService.getUserScores()
      ]);

      setStats(statsData);
      setUserScores(scoresData);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setError('Error al cargar datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccessMessage('');
    if (!isEditing) {
      setEditForm({
        ...editForm,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validación
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (editForm.newPassword && editForm.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const updateData = {
        username: editForm.username,
        email: editForm.email
      };

      if (editForm.currentPassword) {
        updateData.currentPassword = editForm.currentPassword;
      }

      if (editForm.newPassword) {
        updateData.newPassword = editForm.newPassword;
      }

      await authService.updateProfile(updateData);
      
      setSuccessMessage('¡Perfil actualizado exitosamente!');
      setIsEditing(false);
      
      // Recargar datos del usuario
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message || 'Error al actualizar perfil');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      if (window.confirm('¿REALMENTE seguro? Se perderán todos tus datos y puntuaciones.')) {
        try {
          await authService.deleteAccount();
          authService.logout();
          navigate('/');
        } catch (error) {
          setError('Error al eliminar cuenta');
        }
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGameName = (gameSlug) => {
    const games = {
      'snake': 'Snake',
      'space-invaders': 'Space Invaders',
      'tetris': 'Tetris',
      'pong': 'Pong'
    };
    return games[gameSlug] || gameSlug;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Cargando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Volver al Dashboard
        </button>
        <h1>Mi Perfil</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="profile-content">
        {/* Información del usuario */}
        <div className="profile-card user-info">
          <div className="card-header">
            <h2>Información Personal</h2>
            <button className="edit-button" onClick={handleEditToggle}>
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>

          {!isEditing ? (
            <div className="user-details">
              <div className="detail-row">
                <span className="label">Usuario:</span>
                <span className="value">{user.username}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="detail-row">
                <span className="label">Miembro desde:</span>
                <span className="value">{formatDate(user.fecha_registro)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Última sesión:</span>
                <span className="value">
                  {user.ultima_sesion ? formatDate(user.ultima_sesion) : 'Primera vez'}
                </span>
              </div>
            </div>
          ) : (
            <form className="edit-form" onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Nombre de usuario</label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleInputChange}
                  required
                  minLength="3"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-divider">Cambiar contraseña (opcional)</div>

              <div className="form-group">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={editForm.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Requerida para cambios"
                />
              </div>

              <div className="form-group">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={editForm.newPassword}
                  onChange={handleInputChange}
                  placeholder="Dejar vacío para no cambiar"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={editForm.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repetir nueva contraseña"
                />
              </div>

              <button type="submit" className="save-button">
                Guardar Cambios
              </button>
            </form>
          )}
        </div>

        {/* Estadísticas */}
        <div className="profile-card stats-card">
          <h2>Estadísticas Generales</h2>
          {stats ? (
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.total_games || 0}</div>
                <div className="stat-label">Partidas Jugadas</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.total_score || 0}</div>
                <div className="stat-label">Puntos Totales</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{Math.round(stats.avg_score) || 0}</div>
                <div className="stat-label">Promedio</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.best_score || 0}</div>
                <div className="stat-label">Mejor Puntuación</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.games_played || 0}</div>
                <div className="stat-label">Juegos Diferentes</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">#{stats.rank || '?'}</div>
                <div className="stat-label">Ranking Global</div>
              </div>
            </div>
          ) : (
            <p className="no-data">No hay estadísticas disponibles aún</p>
          )}
        </div>

        {/* Mejores puntuaciones */}
        <div className="profile-card scores-card">
          <h2>Tus Mejores Puntuaciones</h2>
          {userScores && userScores.length > 0 ? (
            <div className="scores-table-wrapper">
              <table className="scores-table">
                <thead>
                  <tr>
                    <th>Juego</th>
                    <th>Puntuación</th>
                    <th>Nivel</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {userScores.slice(0, 10).map((score, index) => (
                    <tr key={index}>
                      <td>{getGameName(score.game)}</td>
                      <td className="score-value">{score.score}</td>
                      <td>{score.level}</td>
                      <td>{new Date(score.fecha_registro).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">Aún no tienes puntuaciones registradas</p>
          )}
        </div>

        {/* Zona peligrosa */}
        <div className="profile-card danger-zone">
          <h2>Zona Peligrosa</h2>
          <p>Una vez que elimines tu cuenta, no hay vuelta atrás.</p>
          <button className="delete-button" onClick={handleDeleteAccount}>
            Eliminar Cuenta
          </button>
        </div>
      </div>

      <ThemeToggle />
    </div>
  );
};

export default Profile;
