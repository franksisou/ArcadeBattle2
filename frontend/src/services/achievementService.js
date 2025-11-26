import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5000/api/achievements';

const achievementService = {
  // Obtener todos los logros
  getAllAchievements: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.achievements;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener logros' };
    }
  },

  // Obtener logros del usuario
  getUserAchievements: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener logros del usuario' };
    }
  },

  // Verificar nuevos logros
  checkAchievements: async (scoreData) => {
    try {
      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/check`, scoreData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al verificar logros' };
    }
  },

  // Obtener logros recientes
  getRecentAchievements: async (limit = 5) => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/recent?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.achievements;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener logros recientes' };
    }
  }
};

export default achievementService;
