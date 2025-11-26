// backend/controllers/achievementController.js
const Achievement = require('../models/Achievement');

const achievementController = {
  // Obtener todos los logros
  async getAllAchievements(req, res) {
    try {
      const achievements = await Achievement.getAllAchievements();
      res.json({ achievements });
    } catch (error) {
      console.error('Error obteniendo logros:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener logros del usuario autenticado
  async getUserAchievements(req, res) {
    try {
      const userId = req.user.id;
      console.log('📊 Obteniendo logros para usuario:', userId);
      
      const achievements = await Achievement.getUserAchievements(userId);
      const statsResult = await Achievement.getUserAchievementStats(userId);
      
      const stats = {
        unlocked: statsResult.unlocked_count || 0,
        total: statsResult.total_count || 0,
        totalPoints: statsResult.total_points || 0
      };
      
      console.log('✅ Logros obtenidos:', achievements.length, 'Stats:', stats);
      
      res.json({ 
        achievements,
        stats
      });
    } catch (error) {
      console.error('❌ Error obteniendo logros del usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Verificar nuevos logros después de una partida
  async checkAchievements(req, res) {
    try {
      const userId = req.user.id;
      const { game, score, level } = req.body;
      
      if (!game || score === undefined) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }
      
      const newAchievements = await Achievement.checkAndUnlockAchievements(userId, {
        game,
        score,
        level
      });
      
      res.json({ 
        newAchievements,
        count: newAchievements.length
      });
    } catch (error) {
      console.error('Error verificando logros:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener logros recientes
  async getRecentAchievements(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 5;
      
      const achievements = await Achievement.getRecentAchievements(userId, limit);
      
      res.json({ achievements });
    } catch (error) {
      console.error('Error obteniendo logros recientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = achievementController;
