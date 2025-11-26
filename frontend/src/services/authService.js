import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const authService = {
  // Registrar nuevo usuario
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al registrar usuario' };
    }
  },

  // Iniciar sesión
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Actualizar perfil
  updateProfile: async (updateData) => {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/profile`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Actualizar datos en localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar perfil' };
    }
  },

  // Eliminar cuenta
  deleteAccount: async () => {
    try {
      const token = authService.getToken();
      const response = await axios.delete(`${API_URL}/account`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar cuenta' };
    }
  }
};

export default authService;
