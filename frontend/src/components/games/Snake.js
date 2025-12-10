import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import scoreService from '../../services/scoreService';
import achievementService from '../../services/achievementService';
import AchievementNotification from '../AchievementNotification';
import FloatingActionBar from '../FloatingActionBar';
import RightActionBar from '../RightActionBar';
import './Snake.css';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

const Snake = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const navigate = useNavigate();
  const directionRef = useRef(direction);
  const scoreRef = useRef(0);

  // Actualizar scoreRef cuando cambie score
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Generar comida en posición aleatoria
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    setFood(newFood);
  }, []);

  // Verificar colisión
  const checkCollision = useCallback((head) => {
    // Colisión con paredes
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Colisión con el cuerpo
    for (let segment of snake) {
      if (segment.x === head.x && segment.y === head.y) {
        return true;
      }
    }
    return false;
  }, [snake]);

  // Mover serpiente
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      const currentDirection = directionRef.current;
      
      head.x += currentDirection.x;
      head.y += currentDirection.y;

      // Verificar colisión
      if (checkCollision(head)) {
        const finalScore = scoreRef.current;
        setGameOver(true);
        if (finalScore > highScore) {
          setHighScore(finalScore);
          localStorage.setItem('snakeHighScore', finalScore.toString());
        }
        
        // Guardar puntuación solo si no es invitado
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!currentUser.isGuest) {
          console.log('🐍 Game Over! Guardando puntuación:', finalScore);
          const scoreData = {
            game: 'snake',
            score: finalScore,
            level: 1,
            metadata: { snakeLength: prevSnake.length }
          };
          
          scoreService.saveScore(scoreData)
            .then(() => {
              console.log('✅ Puntuación de Snake guardada exitosamente');
              // Verificar logros
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
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Verificar si comió
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isPaused, food, checkCollision, generateFood, score, highScore]);

  // Manejar teclas
  const handleKeyPress = useCallback((e) => {
    const key = e.key;
    const currentDirection = directionRef.current;

    switch (key) {
      case 'ArrowUp':
        if (currentDirection.y === 0) {
          directionRef.current = { x: 0, y: -1 };
          setDirection({ x: 0, y: -1 });
        }
        e.preventDefault();
        break;
      case 'ArrowDown':
        if (currentDirection.y === 0) {
          directionRef.current = { x: 0, y: 1 };
          setDirection({ x: 0, y: 1 });
        }
        e.preventDefault();
        break;
      case 'ArrowLeft':
        if (currentDirection.x === 0) {
          directionRef.current = { x: -1, y: 0 };
          setDirection({ x: -1, y: 0 });
        }
        e.preventDefault();
        break;
      case 'ArrowRight':
        if (currentDirection.x === 0) {
          directionRef.current = { x: 1, y: 0 };
          setDirection({ x: 1, y: 0 });
        }
        e.preventDefault();
        break;
      case ' ':
        setIsPaused(prev => !prev);
        e.preventDefault();
        break;
      default:
        break;
    }
  }, []);

  // Reiniciar juego
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood({ x: 15, y: 15 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  // Efectos
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  return (
    <div className="snake-game-container">
      <div className="snake-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Volver
        </button>
        <h1>🐍 Snake Battle</h1>
        <div className="snake-scores">
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

      {/* Panel de información del juego */}
      <div className="game-info-panel">
        <div className="info-card">
          <h3>📖 Objetivo</h3>
          <p>Come manzanas para crecer y ganar puntos. ¡Evita chocar con las paredes y contigo mismo!</p>
        </div>
        <div className="info-card">
          <h3>🎮 Controles</h3>
          <p><strong>Flechas</strong> o <strong>WASD</strong>: Mover</p>
          <p><strong>ESPACIO</strong>: Pausar</p>
        </div>
        <div className="info-card">
          <h3>💯 Puntuación</h3>
          <p>+10 puntos por cada manzana</p>
        </div>
      </div>

      <div className="snake-game-content">
        <div className="game-board-container">
          <div 
            className="snake-game-board"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE
            }}
          >
            {/* Serpiente */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`snake-segment ${index === 0 ? 'snake-head' : ''}`}
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE
                }}
              />
            ))}

            {/* Comida */}
            <div
              className="snake-food"
              style={{
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE
              }}
            />

            {/* Mensajes de juego */}
            {gameOver && (
              <div className="game-message">
                <h2>¡Juego Terminado!</h2>
                <p>Puntuación: {score}</p>
                {score > highScore && <p className="new-record">¡Nuevo Récord! 🏆</p>}
                <button onClick={resetGame} className="btn-restart">
                  Jugar de Nuevo
                </button>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="game-message">
                <h2>⏸ Pausado</h2>
                <p>Presiona ESPACIO para continuar</p>
              </div>
            )}
          </div>
        </div>

        <div className="game-controls">
          <h3>Controles</h3>
          <div className="control-item">
            <span>⬆️ ⬇️ ⬅️ ➡️</span>
            <p>Mover serpiente</p>
          </div>
          <div className="control-item">
            <span>ESPACIO</span>
            <p>Pausar/Reanudar</p>
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

export default Snake;
