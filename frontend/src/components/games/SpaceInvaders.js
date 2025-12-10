import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import scoreService from '../../services/scoreService';
import achievementService from '../../services/achievementService';
import AchievementNotification from '../AchievementNotification';
import FloatingActionBar from '../FloatingActionBar';
import RightActionBar from '../RightActionBar';
import './SpaceInvaders.css';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const ENEMY_WIDTH = 35;
const ENEMY_HEIGHT = 25;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 15;

const SpaceInvaders = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [newAchievements, setNewAchievements] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const navigate = useNavigate();
  const scoreRef = useRef(0);
  const levelRef = useRef(1);

  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    scoreRef.current = score;
    levelRef.current = level;
  }, [score, level]);

  const gameStateRef = useRef({
    player: { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 60, width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
    bullets: [],
    enemies: [],
    enemyBullets: [],
    keys: {},
    enemyDirection: 1,
    enemySpeed: 1,
    lastEnemyShot: 0
  });

  // Inicializar enemigos
  const initEnemies = useCallback((level) => {
    const enemies = [];
    const rows = 3 + Math.floor(level / 3);
    const cols = 8;
    const startX = 50;
    const startY = 50;
    const spacingX = 60;
    const spacingY = 50;

    for (let row = 0; row < Math.min(rows, 5); row++) {
      for (let col = 0; col < cols; col++) {
        enemies.push({
          x: startX + col * spacingX,
          y: startY + row * spacingY,
          width: ENEMY_WIDTH,
          height: ENEMY_HEIGHT,
          alive: true
        });
      }
    }
    return enemies;
  }, []);

  // Inicializar juego
  const initGame = useCallback(() => {
    gameStateRef.current = {
      player: { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 60, width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
      bullets: [],
      enemies: initEnemies(level),
      enemyBullets: [],
      keys: {},
      enemyDirection: 1,
      enemySpeed: 1 + (level - 1) * 0.2,
      lastEnemyShot: 0
    };
    setGameOver(false);
    setIsPaused(false);
  }, [level, initEnemies]);

  // Manejar teclas
  useEffect(() => {
    const handleKeyDown = (e) => {
      gameStateRef.current.keys[e.key] = true;
      
      if (e.key === ' ' && !gameOver) {
        e.preventDefault();
        if (!isPaused) {
          // Disparar
          const player = gameStateRef.current.player;
          gameStateRef.current.bullets.push({
            x: player.x + player.width / 2 - BULLET_WIDTH / 2,
            y: player.y,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            speed: 5
          });
        }
      }

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
      }
    };

    const handleKeyUp = (e) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver, isPaused]);

  // Loop del juego
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const gameLoop = () => {
      if (gameOver || isPaused) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const gameState = gameStateRef.current;

      // Limpiar canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Mover jugador
      if (gameState.keys['ArrowLeft'] && gameState.player.x > 0) {
        gameState.player.x -= 5;
      }
      if (gameState.keys['ArrowRight'] && gameState.player.x < CANVAS_WIDTH - gameState.player.width) {
        gameState.player.x += 5;
      }

      // Dibujar jugador
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
      // Cabina
      ctx.fillStyle = '#00aa00';
      ctx.fillRect(gameState.player.x + 15, gameState.player.y - 5, 10, 10);

      // Actualizar y dibujar balas del jugador
      ctx.fillStyle = '#ffff00';
      gameState.bullets = gameState.bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        
        if (bullet.y < 0) return false;

        // Verificar colisión con enemigos
        let hit = false;
        gameState.enemies.forEach(enemy => {
          if (enemy.alive &&
              bullet.x < enemy.x + enemy.width &&
              bullet.x + bullet.width > enemy.x &&
              bullet.y < enemy.y + enemy.height &&
              bullet.y + bullet.height > enemy.y) {
            enemy.alive = false;
            hit = true;
            setScore(prev => prev + 10);
          }
        });

        if (!hit) {
          ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        return !hit;
      });

      // Mover enemigos
      const aliveEnemies = gameState.enemies.filter(e => e.alive);
      
      if (aliveEnemies.length === 0) {
        // Nivel completado
        setLevel(prev => prev + 1);
        initGame();
        return;
      }

      let changeDirection = false;
      aliveEnemies.forEach(enemy => {
        enemy.x += gameState.enemyDirection * gameState.enemySpeed;
        if (enemy.x <= 0 || enemy.x >= CANVAS_WIDTH - enemy.width) {
          changeDirection = true;
        }
      });

      if (changeDirection) {
        gameState.enemyDirection *= -1;
        aliveEnemies.forEach(enemy => {
          enemy.y += 20;
          // Game over si llegan al jugador
          if (enemy.y + enemy.height >= gameState.player.y) {
            const finalScore = scoreRef.current;
            const finalLevel = levelRef.current;
            setGameOver(true);
            if (finalScore > highScore) {
              setHighScore(finalScore);
              localStorage.setItem('spaceInvadersHighScore', finalScore.toString());
            }
            
            // Guardar puntuación solo si no es invitado
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (!currentUser.isGuest) {
              console.log('👾 Game Over! Guardando puntuación:', finalScore);
              const scoreData = {
                game: 'space-invaders',
                score: finalScore,
                level: finalLevel,
                metadata: { enemiesDefeated: aliveEnemies.length }
              };
              
              scoreService.saveScore(scoreData)
                .then(() => {
                  console.log('✅ Puntuación de Space Invaders guardada');
                  return achievementService.checkAchievements(scoreData);
                })
                .then((response) => {
                  if (response && response.newAchievements && response.newAchievements.length > 0) {
                    console.log('🏆 Nuevos logros desbloqueados:', response.newAchievements);
                    setNewAchievements(response.newAchievements);
                    setCurrentNotification(response.newAchievements[0]);
                  }
                })
                .catch(err => {
                  console.error('❌ Error:', err);
                });
            }
          }
        });
      }

      // Dibujar enemigos
      gameState.enemies.forEach(enemy => {
        if (enemy.alive) {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
          ctx.fillStyle = '#ff6666';
          ctx.fillRect(enemy.x + 5, enemy.y + 5, 8, 8);
          ctx.fillRect(enemy.x + enemy.width - 13, enemy.y + 5, 8, 8);
        }
      });

      // Enemigos disparan
      const now = Date.now();
      if (now - gameState.lastEnemyShot > 1000 && aliveEnemies.length > 0) {
        const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        gameState.enemyBullets.push({
          x: randomEnemy.x + randomEnemy.width / 2,
          y: randomEnemy.y + randomEnemy.height,
          width: BULLET_WIDTH,
          height: BULLET_HEIGHT,
          speed: 3
        });
        gameState.lastEnemyShot = now;
      }

      // Actualizar balas enemigas
      ctx.fillStyle = '#ff00ff';
      gameState.enemyBullets = gameState.enemyBullets.filter(bullet => {
        bullet.y += bullet.speed;

        if (bullet.y > CANVAS_HEIGHT) return false;

        // Verificar colisión con jugador
        if (bullet.x < gameState.player.x + gameState.player.width &&
            bullet.x + bullet.width > gameState.player.x &&
            bullet.y < gameState.player.y + gameState.player.height &&
            bullet.y + bullet.height > gameState.player.y) {
          const finalScore = scoreRef.current;
          const finalLevel = levelRef.current;
          setGameOver(true);
          if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('spaceInvadersHighScore', finalScore.toString());
          }
          
          // Guardar puntuación solo si no es invitado
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (!currentUser.isGuest) {
            console.log('👾 Game Over (bala)! Guardando puntuación:', finalScore);
            const scoreData = {
              game: 'space-invaders',
              score: finalScore,
              level: finalLevel,
              metadata: {}
            };
            
            scoreService.saveScore(scoreData)
              .then(() => {
                console.log('✅ Puntuación de Space Invaders guardada');
                return achievementService.checkAchievements(scoreData);
              })
              .then((response) => {
                if (response && response.newAchievements && response.newAchievements.length > 0) {
                  console.log('🏆 Nuevos logros desbloqueados:', response.newAchievements);
                  setNewAchievements(response.newAchievements);
                  setCurrentNotification(response.newAchievements[0]);
                }
              })
              .catch(err => {
                console.error('❌ Error:', err);
              });
          }
          return false;
        }

        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        return true;
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver, isPaused, score, highScore, initGame]);

  // Cargar high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem('spaceInvadersHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    initGame();
  }, [initGame]);

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    initGame();
  };

  return (
    <div className="space-invaders-container">
      <div className="space-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Volver
        </button>
        <h1>👾 Space Invaders</h1>
        <div className="space-scores">
          <div className="score-box">
            <span>Nivel</span>
            <strong>{level}</strong>
          </div>
          <div className="score-box">
            <span>Puntuación</span>
            <strong>{score}</strong>
          </div>
          <div className="score-box">
            <span>Récord</span>
            <strong>{highScore}</strong>
          </div>
        </div>
      </div>

      {/* Panel de información */}
      <div className="game-info-panel">
        <div className="info-card">
          <h3>🎯 Objetivo</h3>
          <p>Destruye todos los invasores alienígenas antes de que lleguen al fondo. ¡Sobrevive y aumenta de nivel!</p>
        </div>
        <div className="info-card">
          <h3>🎮 Controles</h3>
          <p><strong>← →</strong> o <strong>A D</strong>: Mover</p>
          <p><strong>ESPACIO</strong>: Disparar</p>
        </div>
        <div className="info-card">
          <h3>💯 Puntuación</h3>
          <p>Invasor: +100 pts</p>
          <p>Nivel completado: +500 pts</p>
        </div>
      </div>

      <div className="space-game-content">
        <div className="game-canvas-container">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="game-canvas"
          />
          
          {gameOver && (
            <div className="game-overlay">
              <h2>¡Juego Terminado!</h2>
              <p>Nivel alcanzado: {level}</p>
              <p>Puntuación: {score}</p>
              {score > highScore && <p className="new-record">¡Nuevo Récord! 🏆</p>}
              <button onClick={resetGame} className="btn-restart">
                Jugar de Nuevo
              </button>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="game-overlay">
              <h2>⏸ Pausado</h2>
              <p>Presiona P para continuar</p>
            </div>
          )}
        </div>

        <div className="game-controls">
          <h3>Controles</h3>
          <div className="control-item">
            <span>⬅️ ➡️</span>
            <p>Mover nave</p>
          </div>
          <div className="control-item">
            <span>ESPACIO</span>
            <p>Disparar</p>
          </div>
          <div className="control-item">
            <span>P</span>
            <p>Pausar</p>
          </div>
          <button onClick={resetGame} className="btn-new-game">
            Nuevo Juego
          </button>
          {isPaused && (
            <button onClick={() => setIsPaused(false)} className="btn-resume">
              Reanudar
            </button>
          )}
        </div>
      </div>
      
      {/* Notificación de logros */}
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          onClose={() => {
            const nextIndex = newAchievements.indexOf(currentNotification) + 1;
            if (nextIndex < newAchievements.length) {
              setCurrentNotification(newAchievements[nextIndex]);
            } else {
              setCurrentNotification(null);
              setNewAchievements([]);
            }
          }}
        />
      )}
      <FloatingActionBar />
      <RightActionBar />
    </div>
  );
};

export default SpaceInvaders;
