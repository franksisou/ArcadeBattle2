// Script para crear la tabla scores
const { pool } = require('../config/database');

async function createScoresTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        game VARCHAR(50) NOT NULL,
        score INT NOT NULL,
        level INT DEFAULT 1,
        metadata JSON,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_user_game (user_id, game),
        INDEX idx_game_score (game, score DESC),
        INDEX idx_fecha (fecha_registro DESC)
      )
    `;

    await pool.execute(query);
    console.log('✅ Tabla scores creada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tabla:', error);
    process.exit(1);
  }
}

createScoresTable();
