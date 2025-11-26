// backend/controllers/scoreController.js
const Score = require('../models/Score');

const scoreController = {
  // Guardar nueva puntuación
  async saveScore(req, res) {
    try {
      const { game, score, level, metadata } = req.body;
      const userId = req.user.id;

      console.log('📊 Guardando puntuación:', { userId, game, score, level, metadata });

      // Validaciones
      if (!game || score === undefined) {
        return res.status(400).json({ error: 'Juego y puntuación son requeridos' });
      }

      const validGames = ['snake', 'space-invaders', 'tetris', 'pong'];
      if (!validGames.includes(game)) {
        return res.status(400).json({ error: 'Juego no válido' });
      }

      // Guardar puntuación
      const scoreId = await Score.create({
        userId,
        game,
        score,
        level,
        metadata
      });

      console.log('✅ Puntuación guardada con ID:', scoreId);

      res.status(201).json({
        message: 'Puntuación guardada exitosamente',
        scoreId
      });

    } catch (error) {
      console.error('Error guardando puntuación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener puntuaciones del usuario
  async getUserScores(req, res) {
    try {
      const userId = req.user.id;
      const scores = await Score.getUserScores(userId);

      res.json({
        scores
      });

    } catch (error) {
      console.error('Error obteniendo puntuaciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener estadísticas del usuario
  async getUserStats(req, res) {
    try {
      const userId = req.user.id;
      console.log('📊 Obteniendo estadísticas para usuario:', userId);
      
      const stats = await Score.getUserStats(userId);
      console.log('Stats obtenidas:', stats);
      
      const rank = await Score.getUserRank(userId);
      console.log('Rank obtenido:', rank);

      console.log('✅ Estadísticas obtenidas:', { ...stats, rank });

      res.json({
        stats: {
          ...stats,
          rank
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error.message);
      console.error('Stack:', error.stack);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },

  // Obtener leaderboard de un juego específico
  async getGameLeaderboard(req, res) {
    try {
      const { game } = req.params;
      const limit = parseInt(req.query.limit) || 10;

      const validGames = ['snake', 'space-invaders', 'tetris', 'pong'];
      if (!validGames.includes(game)) {
        return res.status(400).json({ error: 'Juego no válido' });
      }

      const leaderboard = await Score.getLeaderboard(game, limit);

      res.json({
        game,
        leaderboard
      });

    } catch (error) {
      console.error('Error obteniendo leaderboard:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener leaderboard global
  async getGlobalLeaderboard(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      console.log('🏆 Obteniendo leaderboard global, limit:', limit);
      
      const leaderboard = await Score.getGlobalLeaderboard(limit);
      
      console.log('✅ Leaderboard obtenido:', leaderboard.length, 'jugadores');

      res.json({
        leaderboard
      });

    } catch (error) {
      console.error('❌ Error obteniendo leaderboard global:', error.message);
      console.error('Stack:', error.stack);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },

  // Obtener mejor puntuación del usuario en un juego
  async getUserBestScore(req, res) {
    try {
      const { game } = req.params;
      const userId = req.user.id;

      const validGames = ['snake', 'space-invaders', 'tetris', 'pong'];
      if (!validGames.includes(game)) {
        return res.status(400).json({ error: 'Juego no válido' });
      }

      const bestScore = await Score.getUserBestScore(userId, game);

      res.json({
        game,
        bestScore: bestScore || null
      });

    } catch (error) {
      console.error('Error obteniendo mejor puntuación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Obtener puntuaciones recientes
  async getRecentScores(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const scores = await Score.getRecentScores(limit);

      res.json({
        scores
      });

    } catch (error) {
      console.error('Error obteniendo puntuaciones recientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = scoreController;
