-- Tabla de logros disponibles
CREATE TABLE IF NOT EXISTS achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  category ENUM('score', 'games', 'skill', 'special') NOT NULL,
  game VARCHAR(50), -- NULL = todos los juegos
  requirement_type ENUM('total_score', 'single_score', 'total_games', 'streak', 'perfect') NOT NULL,
  requirement_value INT NOT NULL,
  points INT NOT NULL DEFAULT 10,
  rarity ENUM('common', 'rare', 'epic', 'legendary') NOT NULL DEFAULT 'common',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logros desbloqueados por usuarios
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- Insertar logros iniciales
INSERT INTO achievements (name, description, icon, category, game, requirement_type, requirement_value, points, rarity) VALUES
-- Logros de Snake
('Primera Serpiente', 'Juega tu primera partida de Snake', '🐍', 'games', 'snake', 'total_games', 1, 5, 'common'),
('Serpiente Novata', 'Alcanza 100 puntos en Snake', '🎯', 'score', 'snake', 'single_score', 100, 10, 'common'),
('Serpiente Experta', 'Alcanza 500 puntos en Snake', '⭐', 'score', 'snake', 'single_score', 500, 25, 'rare'),
('Amo de la Serpiente', 'Alcanza 1000 puntos en Snake', '👑', 'score', 'snake', 'single_score', 1000, 50, 'epic'),
('Serpiente Legendaria', 'Alcanza 2000 puntos en Snake', '🏆', 'score', 'snake', 'single_score', 2000, 100, 'legendary'),

-- Logros de Space Invaders
('Primer Invasor', 'Juega tu primera partida de Space Invaders', '👾', 'games', 'space-invaders', 'total_games', 1, 5, 'common'),
('Defensor Novato', 'Alcanza 1000 puntos en Space Invaders', '🎯', 'score', 'space-invaders', 'single_score', 1000, 10, 'common'),
('Defensor Experto', 'Alcanza 5000 puntos en Space Invaders', '⭐', 'score', 'space-invaders', 'single_score', 5000, 25, 'rare'),
('Héroe Espacial', 'Alcanza 10000 puntos en Space Invaders', '👑', 'score', 'space-invaders', 'single_score', 10000, 50, 'epic'),
('Guardián de la Tierra', 'Alcanza 20000 puntos en Space Invaders', '🏆', 'score', 'space-invaders', 'single_score', 20000, 100, 'legendary'),

-- Logros de Tetris
('Primer Bloque', 'Juega tu primera partida de Tetris', '🎲', 'games', 'tetris', 'total_games', 1, 5, 'common'),
('Constructor Novato', 'Alcanza 1000 puntos en Tetris', '🎯', 'score', 'tetris', 'single_score', 1000, 10, 'common'),
('Constructor Experto', 'Alcanza 5000 puntos en Tetris', '⭐', 'score', 'tetris', 'single_score', 5000, 25, 'rare'),
('Maestro Constructor', 'Alcanza 10000 puntos en Tetris', '👑', 'score', 'tetris', 'single_score', 10000, 50, 'epic'),
('Arquitecto Legendario', 'Alcanza 20000 puntos en Tetris', '🏆', 'score', 'tetris', 'single_score', 20000, 100, 'legendary'),

-- Logros generales
('Primera Victoria', 'Completa tu primera partida', '🎮', 'games', NULL, 'total_games', 1, 5, 'common'),
('Jugador Casual', 'Juega 10 partidas', '🎯', 'games', NULL, 'total_games', 10, 15, 'common'),
('Jugador Dedicado', 'Juega 50 partidas', '⭐', 'games', NULL, 'total_games', 50, 30, 'rare'),
('Jugador Hardcore', 'Juega 100 partidas', '👑', 'games', NULL, 'total_games', 100, 50, 'epic'),
('Campeón Arcade', 'Acumula 10000 puntos totales', '🏆', 'score', NULL, 'total_score', 10000, 50, 'epic'),
('Leyenda Arcade', 'Acumula 50000 puntos totales', '💎', 'score', NULL, 'total_score', 50000, 100, 'legendary'),
('Maestro de Todos', 'Juega los 3 juegos disponibles', '🌟', 'games', NULL, 'total_games', 3, 20, 'rare');
