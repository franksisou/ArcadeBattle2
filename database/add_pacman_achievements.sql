-- ============================================
-- AGREGAR LOGROS DE PAC-MAN
-- ============================================
-- Este script agrega los logros de Pac-Man a la base de datos existente
-- Ejecutar después de tener la base de datos completa

USE arcade_battle;

-- Logros específicos de Pac-Man
INSERT INTO achievements (name, description, icon, category, rarity, points, game, requirement_type, requirement_value) VALUES
('Primera Cacería', 'Juega tu primera partida de Pac-Man', '🟡', 'games', 'common', 5, 'pacman', 'total_games', 1),
('Comedor de Puntos', 'Alcanza 500 puntos en Pac-Man', '🔴', 'score', 'common', 10, 'pacman', 'single_score', 500),
('Cazafantasmas', 'Alcanza 2000 puntos en Pac-Man', '👻', 'score', 'rare', 25, 'pacman', 'single_score', 2000),
('Maestro del Laberinto', 'Alcanza 5000 puntos en Pac-Man', '🏅', 'score', 'epic', 50, 'pacman', 'single_score', 5000),
('Rey del Pac-Man', 'Alcanza 10000 puntos en Pac-Man', '👑', 'score', 'legendary', 100, 'pacman', 'single_score', 10000);

-- Actualizar el logro "Explorador de Juegos" para incluir 4 juegos
-- Primero lo eliminamos
DELETE FROM achievements WHERE name = 'Explorador de Juegos';

-- Lo reinsertamos con los valores correctos
INSERT INTO achievements (name, description, icon, category, rarity, points, game, requirement_type, requirement_value) VALUES
('Explorador de Juegos', 'Juega los 4 juegos diferentes', '🌟', 'special', 'common', 15, NULL, 'unique_games', 4);

-- Verificar que los logros se agregaron correctamente
SELECT * FROM achievements WHERE game = 'pacman';

-- Ver el logro Explorador de Juegos actualizado
SELECT * FROM achievements WHERE name = 'Explorador de Juegos';

-- Ver todos los logros ordenados por juego
SELECT game, name, description, rarity, points, requirement_type, requirement_value 
FROM achievements 
ORDER BY game, requirement_value;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
