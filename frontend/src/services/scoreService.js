import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api/scores`
  : 'http://localhost:5000/api/scores';

const scoreService = {
  // Guardar puntuación
  saveScore: async (scoreData) => {
    try {
      console.log('🎮 Intentando guardar puntuación:', scoreData);
      const token = authService.getToken();
      console.log('🔑 Token:', token ? 'presente' : 'ausente');
      
      const response = await axios.post(API_URL, scoreData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Puntuación guardada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error guardando puntuación:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Error al guardar puntuación' };
    }
  },

  // Obtener puntuaciones del usuario
  getUserScores: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/user/scores`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.scores;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener puntuaciones' };
    }
  },

  // Obtener estadísticas del usuario
  getUserStats: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/user/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.stats;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener estadísticas' };
    }
  },

  // Obtener mejor puntuación del usuario en un juego
  getUserBestScore: async (game) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/user/${game}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.bestScore;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener mejor puntuación' };
    }
  },

  // Obtener leaderboard de un juego
  getGameLeaderboard: async (game, limit = 10) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/leaderboard/${game}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.leaderboard;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener leaderboard' };
    }
  },

  // Obtener leaderboard global
  getGlobalLeaderboard: async (limit = 10) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/leaderboard?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.leaderboard;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener leaderboard global' };
    }
  },

  // Obtener puntuaciones recientes
  getRecentScores: async (limit = 20) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/recent?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.scores;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener puntuaciones recientes' };
    }
  }
};

export default scoreService;
