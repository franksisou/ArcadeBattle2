// backend/models/Score.js
const { pool } = require('../config/database');

class Score {
  // Guardar nueva puntuación
  static async create(scoreData) {
    const { userId, game, score, level, metadata } = scoreData;
    
    const query = `
      INSERT INTO scores (user_id, game, score, level, metadata) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      userId, 
      game, 
      score, 
      level || 1, 
      JSON.stringify(metadata || {})
    ]);
    
    return result.insertId;
  }

  // Obtener mejor puntuación de un usuario en un juego
  static async getUserBestScore(userId, game) {
    const query = `
      SELECT * FROM scores 
      WHERE user_id = ? AND game = ? 
      ORDER BY score DESC 
      LIMIT 1
    `;
    
    const [rows] = await pool.execute(query, [userId, game]);
    return rows[0];
  }

  // Obtener todas las puntuaciones de un usuario
  static async getUserScores(userId) {
    const query = `
      SELECT s.*, u.username 
      FROM scores s
      JOIN usuarios u ON s.user_id = u.id
      WHERE s.user_id = ? 
      ORDER BY s.played_at DESC 
      LIMIT 50
    `;
    
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  // Obtener leaderboard de un juego específico
  static async getGameLeaderboard(game, limit = 10) {
    const limitInt = parseInt(limit, 10) || 10;
    // Usar query en lugar de execute porque mezclamos parámetro preparado con interpolación
    const query = `
      SELECT 
        s.score, 
        s.level, 
        s.fecha_registro,
        u.username,
        u.id as user_id
      FROM scores s
      JOIN usuarios u ON s.user_id = u.id
      WHERE s.game = ?
      ORDER BY s.score DESC
      LIMIT ${limitInt}
    `;
    
    const [rows] = await pool.query(query, [game]);
    return rows;
  }

  // Obtener leaderboard global (todos los juegos)
  static async getGlobalLeaderboard(limit = 10) {
    try {
      // Convertir limit a entero para evitar inyección SQL
      const limitInt = parseInt(limit, 10) || 10;
      const query = `
        SELECT 
          u.username,
          u.id as user_id,
          COALESCE(SUM(s.score), 0) as total_score,
          COUNT(DISTINCT s.game) as games_played,
          COALESCE(MAX(s.score), 0) as best_score
        FROM scores s
        JOIN usuarios u ON s.user_id = u.id
        GROUP BY u.id, u.username
        ORDER BY total_score DESC
        LIMIT ${limitInt}
      `;
      
      const [rows] = await pool.query(query);
      return rows || [];
    } catch (error) {
      console.error('Error en getGlobalLeaderboard:', error);
      throw error;
    }
  }

  // Obtener estadísticas de un usuario
  static async getUserStats(userId) {
    try {
      const query = `
        SELECT 
          COALESCE(COUNT(*), 0) as total_games,
          COALESCE(SUM(score), 0) as total_score,
          COALESCE(AVG(score), 0) as avg_score,
          COALESCE(MAX(score), 0) as best_score,
          COUNT(DISTINCT game) as games_played
        FROM scores
        WHERE user_id = ?
      `;
      
      const [rows] = await pool.execute(query, [userId]);
      return rows[0] || {
        total_games: 0,
        total_score: 0,
        avg_score: 0,
        best_score: 0,
        games_played: 0
      };
    } catch (error) {
      console.error('Error en getUserStats:', error);
      throw error;
    }
  }

  // Obtener ranking de un usuario
  static async getUserRank(userId) {
    try {
      // Primero verificar si el usuario tiene puntuaciones
      const checkQuery = `
        SELECT COUNT(*) as count FROM scores WHERE user_id = ?
      `;
      const [checkResult] = await pool.execute(checkQuery, [userId]);
      
      if (checkResult[0].count === 0) {
        return 0; // Sin ranking si no ha jugado
      }

      const query = `
        SELECT COUNT(*) + 1 as \`rank\`
        FROM (
          SELECT user_id, SUM(score) as total_score
          FROM scores
          GROUP BY user_id
        ) as user_totals
        WHERE total_score > (
          SELECT COALESCE(SUM(score), 0)
          FROM scores
          WHERE user_id = ?
        )
      `;
      
      const [rows] = await pool.execute(query, [userId]);
      return rows[0]?.rank || 1;
    } catch (error) {
      console.error('Error en getUserRank:', error);
      throw error;
    }
  }

  // Obtener puntuaciones recientes
  static async getRecentScores(limit = 20) {
    const limitInt = parseInt(limit, 10) || 20;
    const query = `
      SELECT 
        s.*, 
        u.username
      FROM scores s
      JOIN usuarios u ON s.user_id = u.id
      ORDER BY s.played_at DESC
      LIMIT ${limitInt}
    `;
    
    const [rows] = await pool.query(query);
    return rows;
  }
}

module.exports = Score;
