import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import scoreService from '../../services/scoreService';
import authService from '../../services/authService';
import AchievementNotification from '../AchievementNotification';
import FloatingActionBar from '../FloatingActionBar';
import RightActionBar from '../RightActionBar';
import './Pacman.css';

const CELL_SIZE = 24;
const GRID_WIDTH = 28;
const GRID_HEIGHT = 31;
const GAME_SPEED = 120;
const GHOST_SPEED = 140;
const POWER_MODE_DURATION = 10000;
const FRIGHTENED_SPEED = 200;

const Pacman = () => {
  const [pacman, setPacman] = useState({ x: 14, y: 23, direction: { x: 0, y: 0 }, nextDirection: { x: 0, y: 0 }, mouthOpen: true });
  const [ghosts, setGhosts] = useState([
    { id: 'blinky', x: 12, y: 14, color: '#FF0000', startColor: '#FF0000', direction: { x: 1, y: 0 }, mode: 'scatter' },
    { id: 'pinky', x: 13, y: 14, color: '#FFB8FF', startColor: '#FFB8FF', direction: { x: -1, y: 0 }, mode: 'scatter' },
    { id: 'inky', x: 14, y: 14, color: '#00FFFF', startColor: '#00FFFF', direction: { x: 0, y: 1 }, mode: 'scatter' },
    { id: 'clyde', x: 15, y: 14, color: '#FFB852', startColor: '#FFB852', direction: { x: 0, y: -1 }, mode: 'scatter' }
  ]);
  const [dots, setDots] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [powerMode, setPowerMode] = useState(false);
  const [powerModeTimer, setPowerModeTimer] = useState(null);
  const [level, setLevel] = useState(1);
  const [ghostsEaten, setGhostsEaten] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [invincible, setInvincible] = useState(false);
  const navigate = useNavigate();
  const directionRef = useRef({ x: 0, y: 0 });
  const nextDirectionRef = useRef({ x: 0, y: 0 });
  const scoreRef = useRef(0);
  const pacmanTimerRef = useRef(null);
  const ghostTimerRef = useRef(null);

  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,1,1,1,2,2,1,1,1,0,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,1,2,2,2,2,2,2,1,0,1,1,0,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,0,1,1,0,1,2,2,2,2,2,2,1,0,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
    [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
    [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  useEffect(() => {
    scoreRef.current = score;
    console.log('Score actualizado:', score);
  }, [score]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('pacmanHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    initializeDots();
    // eslint-disable-next-line
  }, []);

  const initializeDots = () => {
    const newDots = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (maze[y][x] === 0) {
          newDots.push({ x, y, isPower: (x === 1 && y === 3) || (x === 26 && y === 3) || (x === 1 && y === 23) || (x === 26 && y === 23) });
        }
      }
    }
    setDots(newDots);
  };

  const checkCollision = (x, y) => {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return true;
    return maze[y][x] === 1;
  };

  const resetPositions = () => {
    setPacman({ x: 14, y: 23, direction: { x: 0, y: 0 }, nextDirection: { x: 0, y: 0 }, mouthOpen: true });
    directionRef.current = { x: 0, y: 0 };
    nextDirectionRef.current = { x: 0, y: 0 };
    setGhosts([
      { id: 'blinky', x: 12, y: 14, color: '#FF0000', startColor: '#FF0000', direction: { x: 1, y: 0 }, mode: 'chase' },
      { id: 'pinky', x: 13, y: 14, color: '#FFB8FF', startColor: '#FFB8FF', direction: { x: -1, y: 0 }, mode: 'scatter' },
      { id: 'inky', x: 14, y: 14, color: '#00FFFF', startColor: '#00FFFF', direction: { x: 0, y: 1 }, mode: 'scatter' },
      { id: 'clyde', x: 15, y: 14, color: '#FFB852', startColor: '#FFB852', direction: { x: 0, y: -1 }, mode: 'scatter' }
    ]);
  };

  const movePacman = () => {
    if (gameOver || isPaused) return;

    setPacman(prev => {
      let newX = prev.x + nextDirectionRef.current.x;
      let newY = prev.y + nextDirectionRef.current.y;
      
      if (checkCollision(newX, newY)) {
        newX = prev.x + directionRef.current.x;
        newY = prev.y + directionRef.current.y;
        
        if (checkCollision(newX, newY)) {
          return { ...prev, mouthOpen: !prev.mouthOpen };
        }
      } else {
        directionRef.current = { ...nextDirectionRef.current };
      }

      if (newX < 0) newX = GRID_WIDTH - 1;
      if (newX >= GRID_WIDTH) newX = 0;

      return { 
        x: newX, 
        y: newY, 
        direction: directionRef.current,
        nextDirection: nextDirectionRef.current,
        mouthOpen: !prev.mouthOpen 
      };
    });
  };

  const moveGhosts = () => {
    if (gameOver || isPaused) return;

    setGhosts(prev => prev.map(ghost => {
      const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
      ];

      let validDirections = directions.filter(dir => {
        const newX = ghost.x + dir.x;
        const newY = ghost.y + dir.y;
        const isReverse = dir.x === -ghost.direction.x && dir.y === -ghost.direction.y;
        return !checkCollision(newX, newY) && !isReverse;
      });

      if (validDirections.length === 0) {
        validDirections = directions.filter(dir => 
          !checkCollision(ghost.x + dir.x, ghost.y + dir.y)
        );
      }

      if (validDirections.length === 0) return ghost;

      let direction;
      
      if (ghost.mode === 'frightened') {
        direction = validDirections[Math.floor(Math.random() * validDirections.length)];
      } else if (ghost.mode === 'scatter') {
        const corners = {
          'blinky': { x: 25, y: 0 },
          'pinky': { x: 2, y: 0 },
          'inky': { x: 27, y: 30 },
          'clyde': { x: 0, y: 30 }
        };
        const target = corners[ghost.id];
        direction = validDirections.reduce((best, dir) => {
          const newX = ghost.x + dir.x;
          const newY = ghost.y + dir.y;
          const distBest = Math.abs(ghost.x + best.x - target.x) + Math.abs(ghost.y + best.y - target.y);
          const distCurr = Math.abs(newX - target.x) + Math.abs(newY - target.y);
          return distCurr < distBest ? dir : best;
        });
      } else {
        direction = validDirections.reduce((best, dir) => {
          const newX = ghost.x + dir.x;
          const newY = ghost.y + dir.y;
          const distBest = Math.abs(ghost.x + best.x - pacman.x) + Math.abs(ghost.y + best.y - pacman.y);
          const distCurr = Math.abs(newX - pacman.x) + Math.abs(newY - pacman.y);
          return distCurr < distBest ? dir : best;
        });
      }

      let newX = ghost.x + direction.x;
      let newY = ghost.y + direction.y;

      if (newX < 0) newX = GRID_WIDTH - 1;
      if (newX >= GRID_WIDTH) newX = 0;

      return {
        ...ghost,
        x: newX,
        y: newY,
        direction
      };
    }));
  };

  useEffect(() => {
    const dotIndex = dots.findIndex(dot => dot.x === pacman.x && dot.y === pacman.y);
    if (dotIndex !== -1) {
      const dot = dots[dotIndex];
      setDots(prev => prev.filter((_, i) => i !== dotIndex));
      
      if (dot.isPower) {
        setScore(prev => prev + 50);
        setGhostsEaten(0);
        
        if (powerModeTimer) clearTimeout(powerModeTimer);
        
        setPowerMode(true);
        setGhosts(prev => prev.map(g => ({ 
          ...g, 
          mode: 'frightened',
          color: '#2121DE'
        })));
        
        const timer = setTimeout(() => {
          setPowerMode(false);
          setGhosts(prev => prev.map(g => ({ 
            ...g, 
            mode: 'chase',
            color: g.startColor
          })));
        }, POWER_MODE_DURATION);
        
        setPowerModeTimer(timer);
      } else {
        setScore(prev => prev + 10);
      }
    }

    if (dots.length === 1) {
      setLevel(prev => prev + 1);
      initializeDots();
      resetPositions();
    }
    // eslint-disable-next-line
  }, [pacman.x, pacman.y, dots, powerModeTimer]);

  const handleGameOver = async () => {
    console.log('=== GAME OVER ===');
    setGameOver(true);
    
    const finalScore = scoreRef.current;
    console.log('Puntuación final:', finalScore);
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('pacmanHighScore', finalScore.toString());
    }

    // No guardar si es usuario invitado
    const currentUser = authService.getCurrentUser();
    console.log('Usuario actual:', currentUser);
    
    if (currentUser?.isGuest) {
      console.log('Usuario invitado - no se guarda la puntuación');
      return;
    }

    if (!currentUser) {
      console.log('No hay usuario logueado');
      return;
    }

    try {
      console.log('Guardando puntuación de Pac-Man:', finalScore);
      const result = await scoreService.saveScore({
        game: 'pacman',
        score: finalScore
      });

      console.log('Resultado del servidor:', result);

      if (result.achievements && result.achievements.length > 0) {
        console.log('Logros desbloqueados:', result.achievements);
        setNewAchievements(result.achievements);
        setCurrentNotification(result.achievements[0]);
      }
    } catch (error) {
      console.error('Error guardando puntuación:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (invincible || gameOver || isPaused) return;

    ghosts.forEach(ghost => {
      if (ghost.x === pacman.x && ghost.y === pacman.y) {
        if (ghost.mode === 'frightened') {
          const points = [200, 400, 800, 1600][ghostsEaten];
          setScore(prev => prev + points);
          setGhostsEaten(prev => prev + 1);
          
          setGhosts(prev => prev.map(g => 
            g.id === ghost.id 
              ? { ...g, x: 14, y: 14, mode: 'chase', color: g.startColor }
              : g
          ));
        } else if (ghost.mode !== 'eaten') {
          setInvincible(true);
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              handleGameOver();
            } else {
              setTimeout(() => {
                resetPositions();
                setInvincible(false);
              }, 1000);
            }
            return newLives;
          });
        }
      }
    });
    // eslint-disable-next-line
  }, [pacman.x, pacman.y, ghosts, invincible, ghostsEaten, gameOver, isPaused]);

  const handleKeyPress = useCallback((e) => {
    if (gameOver) return;
    
    e.preventDefault();
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        nextDirectionRef.current = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        nextDirectionRef.current = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        nextDirectionRef.current = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        nextDirectionRef.current = { x: 1, y: 0 };
        break;
      case ' ':
        setIsPaused(prev => !prev);
        break;
      default:
        break;
    }
  }, [gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Timer para Pac-Man
  useEffect(() => {
    if (gameOver || isPaused) {
      if (pacmanTimerRef.current) {
        clearInterval(pacmanTimerRef.current);
        pacmanTimerRef.current = null;
      }
      return;
    }
    
    if (!pacmanTimerRef.current) {
      pacmanTimerRef.current = setInterval(() => {
        movePacman();
      }, GAME_SPEED);
    }

    return () => {
      if (pacmanTimerRef.current) {
        clearInterval(pacmanTimerRef.current);
        pacmanTimerRef.current = null;
      }
    };
  }, [gameOver, isPaused]);

  // Timer para fantasmas (independiente de Pac-Man)
  useEffect(() => {
    if (gameOver || isPaused) {
      if (ghostTimerRef.current) {
        clearInterval(ghostTimerRef.current);
        ghostTimerRef.current = null;
      }
      return;
    }
    
    // Limpiar timer anterior si existe
    if (ghostTimerRef.current) {
      clearInterval(ghostTimerRef.current);
    }
    
    const ghostSpeed = powerMode ? FRIGHTENED_SPEED : GHOST_SPEED;
    ghostTimerRef.current = setInterval(() => {
      moveGhosts();
    }, ghostSpeed);

    return () => {
      if (ghostTimerRef.current) {
        clearInterval(ghostTimerRef.current);
        ghostTimerRef.current = null;
      }
    };
  }, [gameOver, isPaused, powerMode]);

  const restartGame = () => {
    if (powerModeTimer) clearTimeout(powerModeTimer);
    if (pacmanTimerRef.current) clearInterval(pacmanTimerRef.current);
    if (ghostTimerRef.current) clearInterval(ghostTimerRef.current);
    
    initializeDots();
    resetPositions();
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setPowerMode(false);
    setGhostsEaten(0);
    setInvincible(false);
    setPowerModeTimer(null);
    scoreRef.current = 0;
  };

  return (
    <div className="pacman-container">
      <div className="pacman-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Volver
        </button>
        <h1>🟡 PAC-MAN</h1>
        <div className="pacman-stats">
          <div className="stat">Puntuación: {score}</div>
          <div className="stat">Récord: {highScore}</div>
          <div className="stat">Nivel: {level}</div>
          <div className="stat">Vidas: {'❤️'.repeat(lives)}</div>
        </div>
      </div>

      <div className="pacman-game-area">
        <div 
          className="pacman-grid"
          style={{
            width: GRID_WIDTH * CELL_SIZE,
            height: GRID_HEIGHT * CELL_SIZE
          }}
        >
          {maze.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`cell ${cell === 1 ? 'wall' : cell === 2 ? 'ghost-house' : ''}`}
                style={{
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE
                }}
              />
            ))
          )}
          
          {dots.map((dot, i) => (
            <div
              key={i}
              className={`dot ${dot.isPower ? 'power-dot' : ''}`}
              style={{
                left: dot.x * CELL_SIZE + CELL_SIZE / 2 - (dot.isPower ? 4 : 1.5),
                top: dot.y * CELL_SIZE + CELL_SIZE / 2 - (dot.isPower ? 4 : 1.5)
              }}
            />
          ))}
          
          <div
            className={`pacman ${pacman.mouthOpen ? 'mouth-open' : 'mouth-closed'} ${invincible ? 'invincible' : ''}`}
            style={{
              left: pacman.x * CELL_SIZE,
              top: pacman.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              transform: `rotate(${
                pacman.direction.x === 1 ? 0 : 
                pacman.direction.x === -1 ? 180 : 
                pacman.direction.y === 1 ? 90 : 
                pacman.direction.y === -1 ? -90 : 0
              }deg)`
            }}
          />
          
          {ghosts.map((ghost) => (
            <div
              key={ghost.id}
              className={`ghost ${ghost.mode === 'frightened' ? 'frightened' : ''} ghost-${ghost.id}`}
              style={{
                left: ghost.x * CELL_SIZE,
                top: ghost.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: ghost.color
              }}
            >
              {ghost.mode !== 'frightened' && (
                <div className="ghost-eyes">
                  <div className="ghost-eye"></div>
                  <div className="ghost-eye"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {isPaused && !gameOver && (
          <div className="pacman-overlay">
            <div className="pacman-message">
              <h2>⏸️ PAUSA</h2>
              <p>Presiona ESPACIO para continuar</p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="pacman-overlay">
            <div className="pacman-message">
              <h2>GAME OVER</h2>
              <p>Puntuación Final: {score}</p>
              {score === highScore && score > 0 && <p className="high-score-text">🏆 ¡NUEVO RÉCORD!</p>}
              <div className="game-over-buttons">
                <button onClick={restartGame} className="btn-restart">
                  🔄 Jugar de Nuevo
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn-menu">
                  📋 Menú Principal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pacman-controls">
        <p>Controles: ⬆️⬇️⬅️➡️ o WASD | ESPACIO = Pausa</p>
        {!gameOver && (
          <button onClick={() => setIsPaused(!isPaused)} className="btn-pause">
            {isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}
          </button>
        )}
      </div>

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

export default Pacman;
