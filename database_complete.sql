-- ============================================
-- BASE DE DATOS COMPLETA: ARCADEBATTLE
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS arcade_battle;
USE arcade_battle;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: scores
-- ============================================
CREATE TABLE IF NOT EXISTS scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game VARCHAR(50) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  level INT DEFAULT 1,
  metadata JSON,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_user_game (user_id, game),
  INDEX idx_game_score (game, score DESC),
  INDEX idx_played_at (played_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: achievements
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) DEFAULT '🏆',
  category VARCHAR(50) NOT NULL,
  rarity VARCHAR(20) NOT NULL DEFAULT 'common',
  points INT NOT NULL DEFAULT 10,
  game VARCHAR(50),
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_rarity (rarity),
  INDEX idx_game (game)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: user_achievements
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  progress INT DEFAULT 0,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id),
  INDEX idx_user_unlocked (user_id, unlocked_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES: LOGROS
-- ============================================

-- Logros de Snake (Common)
INSERT INTO achievements (name, description, icon, category, rarity, points, game, requirement_type, requirement_value) VALUES
('Primera Serpiente', 'Juega tu primera partida de Snake', '🐍', 'games', 'common', 5, 'snake', 'total_games', 1),
('Serpiente Hambrienta', 'Alcanza 100 puntos en Snake', '🍎', 'score', 'common', 10, 'snake', 'single_score', 100),
('Serpiente Veloz', 'Alcanza 500 puntos en Snake', '⚡', 'score', 'rare', 25, 'snake', 'single_score', 500),
('Rey Serpiente', 'Alcanza 1000 puntos en Snake', '👑', 'score', 'epic', 50, 'snake', 'single_score', 1000),
('Serpiente Legendaria', 'Alcanza 2000 puntos en Snake', '🐉', 'score', 'legendary', 100, 'snake', 'single_score', 2000);

-- Logros de Space Invaders (Common)
INSERT INTO achievements (name, description, icon, category, rarity, points, game, requirement_type, requirement_value) VALUES
('Primera Invasión', 'Juega tu primera partida de Space Invaders', '👾', 'games', 'common', 5, 'space-invaders', 'total_games', 1),
('Defensor Novato', 'Alcanza 200 puntos en Space Invaders', '🛸', 'score', 'common', 10, 'space-invaders', 'single_score', 200),
('Cazador Espacial', 'Alcanza 1000 puntos en Space Invaders', '🚀', 'score', 'rare', 25, 'space-invaders', 'single_score', 1000),
('Héroe Galáctico', 'Alcanza 2500 puntos en Space Invaders', '⭐', 'score', 'epic', 50, 'space-invaders', 'single_score', 2500),
('Salvador del Universo', 'Alcanza 5000 puntos en Space Invaders', '🌟', 'score', 'legendary', 100, 'space-invaders', 'single_score', 5000);

-- Logros de Tetris (Common)
INSERT INTO achievements (name, description, icon, category, rarity, points, game, requirement_type, requirement_value) VALUES
('Primer Bloque', 'Juega tu primera partida de Tetris', '🎮', 'games', 'common', 5, 'tetris', 'total_games', 1),
('Constructor Novato', 'Alcanza 300 puntos en Tetris', '🧱', 'score', 'common', 10, 'tetris', 'single_score', 300),
('Maestro de Bloques', 'Alcanza 1500 puntos en Tetris', '🎯', 'score', 'rare', 25, 'tetris', 'single_score', 1500),
('Arquitecto Perfecto', 'Alcanza 3000 puntos en Tetris', '🏗️', 'score', 'epic', 50, 'tetris', 'single_score', 3000),
('Dios del Tetris', 'Alcanza 6000 puntos en Tetris', '💎', 'score', 'legendary', 100, 'tetris', 'single_score', 6000);

-- Logros Generales
INSERT INTO achievements (name, description, icon, category, rarity, points, game, requirement_type, requirement_value) VALUES
('Jugador Dedicado', 'Juega 10 partidas en total', '🎲', 'games', 'common', 15, NULL, 'total_games', 10),
('Adicto a los Juegos', 'Juega 50 partidas en total', '🕹️', 'games', 'rare', 30, NULL, 'total_games', 50),
('Maestro Arcade', 'Juega 100 partidas en total', '🏆', 'games', 'epic', 50, NULL, 'total_games', 100),
('Cazador de Puntos', 'Acumula 5000 puntos en total', '💯', 'score', 'rare', 20, NULL, 'total_score', 5000),
('Coleccionista de Victorias', 'Acumula 10000 puntos en total', '🎖️', 'score', 'epic', 50, NULL, 'total_score', 10000),
('Leyenda del Arcade', 'Acumula 50000 puntos en total', '👑', 'special', 'legendary', 100, NULL, 'total_score', 50000),
('Explorador de Juegos', 'Juega los 3 juegos diferentes', '🌟', 'special', 'common', 15, NULL, 'total_games', 3);

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índice para búsquedas de puntuación por usuario y juego
CREATE INDEX idx_scores_user_game_score ON scores(user_id, game, score DESC);

-- Índice para estadísticas globales
CREATE INDEX idx_scores_game_played ON scores(game, played_at DESC);

-- ============================================
-- CONSULTAS ÚTILES PARA VERIFICACIÓN
-- ============================================

-- Ver todos los usuarios
-- SELECT * FROM usuarios;

-- Ver todas las puntuaciones
-- SELECT u.username, s.game, s.score, s.level, s.played_at 
-- FROM scores s 
-- JOIN usuarios u ON s.user_id = u.id 
-- ORDER BY s.played_at DESC;

-- Ver todos los logros
-- SELECT * FROM achievements ORDER BY category, requirement_value;

-- Ver logros desbloqueados por usuario
-- SELECT u.username, a.name, a.description, ua.unlocked_at
-- FROM user_achievements ua
-- JOIN usuarios u ON ua.user_id = u.id
-- JOIN achievements a ON ua.achievement_id = a.id
-- ORDER BY ua.unlocked_at DESC;

-- Estadísticas de un usuario
-- SELECT 
--   u.username,
--   COUNT(s.id) as total_partidas,
--   SUM(s.score) as puntos_totales,
--   MAX(s.score) as mejor_puntuacion,
--   COUNT(DISTINCT s.game) as juegos_diferentes,
--   COUNT(DISTINCT ua.achievement_id) as logros_desbloqueados
-- FROM usuarios u
-- LEFT JOIN scores s ON u.id = s.user_id
-- LEFT JOIN user_achievements ua ON u.id = ua.user_id
-- WHERE u.id = 1
-- GROUP BY u.id;

-- Leaderboard global
-- SELECT u.username, s.game, s.score, s.played_at
-- FROM scores s
-- JOIN usuarios u ON s.user_id = u.id
-- ORDER BY s.score DESC
-- LIMIT 10;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
