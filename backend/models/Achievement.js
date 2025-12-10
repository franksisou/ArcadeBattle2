const { pool } = require('../config/database');

class Achievement {
  static async getAllAchievements() {
    const query = 'SELECT * FROM achievements ORDER BY category, requirement_value ASC';
    const [rows] = await pool.query(query);
    return rows;
  }

  static async getUserAchievements(userId) {
    const query = `
      SELECT 
        a.*,
        ua.unlocked_at,
        ua.progress,
        CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as unlocked
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
      ORDER BY unlocked DESC, a.category, a.requirement_value ASC
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  }

  static async unlockAchievement(userId, achievementId) {
    try {
      const query = `
        INSERT INTO user_achievements (user_id, achievement_id, progress)
        VALUES (?, ?, 100)
        ON DUPLICATE KEY UPDATE progress = 100, unlocked_at = CURRENT_TIMESTAMP
      `;
      await pool.execute(query, [userId, achievementId]);
      return true;
    } catch (error) {
      console.error('Error desbloqueando logro:', error);
      return false;
    }
  }

  static async checkAndUnlockAchievements(userId, scoreData) {
    try {
      const newlyUnlocked = [];
      
      const [userStats] = await pool.query(`
        SELECT 
          COUNT(*) as total_games,
          SUM(score) as total_score,
          MAX(score) as best_score,
          COUNT(DISTINCT game) as different_games
        FROM scores
        WHERE user_id = ?
      `, [userId]);
      
      const stats = userStats[0];
      
      const currentGameScore = scoreData.score;
      const currentGame = scoreData.game;
      
      const [achievements] = await pool.query(`
        SELECT a.* 
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        WHERE ua.id IS NULL
      `, [userId]);
      
      for (const achievement of achievements) {
        let shouldUnlock = false;
        
        if (achievement.game && achievement.game !== currentGame) {
          continue;
        }
        
        switch (achievement.requirement_type) {
          case 'total_score':
            shouldUnlock = stats.total_score >= achievement.requirement_value;
            break;
            
          case 'single_score':
            if (!achievement.game || achievement.game === currentGame) {
              shouldUnlock = currentGameScore >= achievement.requirement_value;
            }
            break;
            
          case 'total_games':
            if (achievement.game) {
              const [gameStats] = await pool.query(
                'SELECT COUNT(*) as count FROM scores WHERE user_id = ? AND game = ?',
                [userId, achievement.game]
              );
              shouldUnlock = gameStats[0].count >= achievement.requirement_value;
            } else {
              shouldUnlock = stats.total_games >= achievement.requirement_value;
            }
            break;
            
          case 'unique_games':
            shouldUnlock = stats.different_games >= achievement.requirement_value;
            break;
        }
        
        if (shouldUnlock) {
          await this.unlockAchievement(userId, achievement.id);
          newlyUnlocked.push(achievement);
        }
      }
      
      return newlyUnlocked;
      
    } catch (error) {
      console.error('Error verificando logros:', error);
      return [];
    }
  }

  static async getUserAchievementStats(userId) {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT ua.achievement_id) as unlocked_count,
        (SELECT COUNT(*) FROM achievements) as total_count,
        COALESCE(SUM(a.points), 0) as total_points
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
    `, [userId]);
    
    return stats[0];
  }

  static async getRecentAchievements(userId, limit = 5) {
    const query = `
      SELECT a.*, ua.unlocked_at
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ?
      ORDER BY ua.unlocked_at DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(query, [userId, limit]);
    return rows;
  }
}

module.exports = Achievement;
