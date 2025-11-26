import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import scoreService from '../../services/scoreService';
import achievementService from '../../services/achievementService';
import AchievementNotification from '../AchievementNotification';
import './Tetris.css';

const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 30;

const SHAPES = [
  { shape: [[1, 1, 1, 1]], color: '#00ffff' }, // I
  { shape: [[1, 1], [1, 1]], color: '#ffff00' }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#800080' }, // T
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#00ff00' }, // S
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#ff0000' }, // Z
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' }, // J
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#ffa500' }, // L
];

const Tetris = () => {
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const navigate = useNavigate();
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const linesRef = useRef(0);

  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    scoreRef.current = score;
    levelRef.current = level;
    linesRef.current = lines;
  }, [score, level, lines]);

  const currentPieceRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const dropTimeRef = useRef(1000);
  const lastDropTimeRef = useRef(Date.now());

  // Crear nueva pieza
  const createPiece = useCallback(() => {
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      shape: randomShape.shape.map(row => [...row]),
      color: randomShape.color
    };
  }, []);

  // Verificar colisión
  const checkCollision = useCallback((piece, position, newBoard = board) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newY = position.y + y;
          const newX = position.x + x;
          
          if (newY >= ROWS || newX < 0 || newX >= COLS || (newY >= 0 && newBoard[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  }, [board]);

  // Rotar pieza
  const rotatePiece = useCallback(() => {
    if (!currentPieceRef.current || gameOver || isPaused) return;

    const rotated = currentPieceRef.current.shape[0].map((_, i) =>
      currentPieceRef.current.shape.map(row => row[i]).reverse()
    );

    const testPiece = { ...currentPieceRef.current, shape: rotated };
    
    if (!checkCollision(testPiece, positionRef.current)) {
      currentPieceRef.current.shape = rotated;
      setBoard(prev => [...prev]);
    }
  }, [gameOver, isPaused, checkCollision]);

  // Mover pieza
  const movePiece = useCallback((direction) => {
    if (!currentPieceRef.current || gameOver || isPaused) return;

    const newPosition = { ...positionRef.current };
    
    if (direction === 'left') newPosition.x -= 1;
    if (direction === 'right') newPosition.x += 1;
    if (direction === 'down') newPosition.y += 1;

    if (!checkCollision(currentPieceRef.current, newPosition)) {
      positionRef.current = newPosition;
      setBoard(prev => [...prev]);
    } else if (direction === 'down') {
      // Fijar pieza al tablero
      mergePieceToBoard();
    }
  }, [gameOver, isPaused, checkCollision]);

  // Fusionar pieza con el tablero
  const mergePieceToBoard = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    const piece = currentPieceRef.current;
    const position = positionRef.current;

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }

    // Verificar líneas completas
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== null)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(null));
        linesCleared++;
        y++; // Revisar la misma fila nuevamente
      }
    }

    if (linesCleared > 0) {
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);
      setLevel(Math.floor(lines / 10) + 1);
    }

    setBoard(newBoard);

    // Nueva pieza
    const newPiece = createPiece();
    const newPosition = { x: Math.floor(COLS / 2) - 1, y: 0 };

    if (checkCollision(newPiece, newPosition, newBoard)) {
      const finalScore = scoreRef.current;
      const finalLevel = levelRef.current;
      const finalLines = linesRef.current;
      setGameOver(true);
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('tetrisHighScore', finalScore.toString());
      }
      
      // Guardar puntuación solo si no es invitado
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!currentUser.isGuest) {
        console.log('🎲 Game Over! Guardando puntuación:', finalScore);
        const scoreData = {
          game: 'tetris',
          score: finalScore,
          level: finalLevel,
          metadata: { lines: finalLines }
        };
        
        scoreService.saveScore(scoreData)
          .then(() => {
            console.log('✅ Puntuación de Tetris guardada exitosamente');
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
    } else {
      currentPieceRef.current = newPiece;
      positionRef.current = newPosition;
    }
  }, [board, score, highScore, level, lines, createPiece, checkCollision]);

  // Drop rápido
  const hardDrop = useCallback(() => {
    if (!currentPieceRef.current || gameOver || isPaused) return;

    while (!checkCollision(currentPieceRef.current, { ...positionRef.current, y: positionRef.current.y + 1 })) {
      positionRef.current.y += 1;
    }
    mergePieceToBoard();
  }, [gameOver, isPaused, checkCollision, mergePieceToBoard]);

  // Manejar teclas
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          movePiece('left');
          e.preventDefault();
          break;
        case 'ArrowRight':
          movePiece('right');
          e.preventDefault();
          break;
        case 'ArrowDown':
          movePiece('down');
          e.preventDefault();
          break;
        case 'ArrowUp':
          rotatePiece();
          e.preventDefault();
          break;
        case ' ':
          hardDrop();
          e.preventDefault();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, rotatePiece, hardDrop, gameOver]);

  // Inicializar juego
  useEffect(() => {
    const savedHighScore = localStorage.getItem('tetrisHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    currentPieceRef.current = createPiece();
    positionRef.current = { x: Math.floor(COLS / 2) - 1, y: 0 };
  }, [createPiece]);

  // Game loop
  useEffect(() => {
    dropTimeRef.current = Math.max(200, 1000 - (level - 1) * 100);

    const gameLoop = setInterval(() => {
      if (!gameOver && !isPaused) {
        const now = Date.now();
        if (now - lastDropTimeRef.current > dropTimeRef.current) {
          movePiece('down');
          lastDropTimeRef.current = now;
        }
      }
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameOver, isPaused, level, movePiece]);

  // Renderizar tablero con pieza actual
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    if (currentPieceRef.current && !gameOver) {
      const piece = currentPieceRef.current;
      const position = positionRef.current;

      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
              displayBoard[boardY][boardX] = piece.color;
            }
          }
        }
      }
    }

    return displayBoard;
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    currentPieceRef.current = createPiece();
    positionRef.current = { x: Math.floor(COLS / 2) - 1, y: 0 };
    lastDropTimeRef.current = Date.now();
  };

  const displayBoard = renderBoard();

  return (
    <div className="tetris-container">
      <div className="tetris-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Volver
        </button>
        <h1>🎲 Tetris</h1>
        <div className="tetris-scores">
          <div className="score-box">
            <span>Nivel</span>
            <strong>{level}</strong>
          </div>
          <div className="score-box">
            <span>Líneas</span>
            <strong>{lines}</strong>
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
          <p>Completa líneas horizontales colocando las piezas que caen. ¡No dejes que la torre llegue arriba!</p>
        </div>
        <div className="info-card">
          <h3>🎮 Controles</h3>
          <p><strong>← →</strong>: Mover</p>
          <p><strong>↓</strong>: Caída rápida</p>
          <p><strong>↑</strong> o <strong>W</strong>: Rotar</p>
        </div>
        <div className="info-card">
          <h3>💯 Puntuación</h3>
          <p>1 línea: +100</p>
          <p>2 líneas: +300</p>
          <p>3 líneas: +500</p>
          <p>4 líneas (Tetris): +800</p>
        </div>
      </div>

      <div className="tetris-game-content">
        <div className="tetris-board-container">
          <div 
            className="tetris-board"
            style={{
              gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`
            }}
          >
            {displayBoard.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className="tetris-cell"
                  style={{
                    backgroundColor: cell || '#1a1a1a',
                    border: cell ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)'
                  }}
                />
              ))
            )}
          </div>

          {gameOver && (
            <div className="game-overlay">
              <h2>¡Juego Terminado!</h2>
              <p>Nivel: {level}</p>
              <p>Líneas: {lines}</p>
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
            <p>Mover</p>
          </div>
          <div className="control-item">
            <span>⬆️</span>
            <p>Rotar</p>
          </div>
          <div className="control-item">
            <span>⬇️</span>
            <p>Bajar rápido</p>
          </div>
          <div className="control-item">
            <span>ESPACIO</span>
            <p>Drop inmediato</p>
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
    </div>
  );
};

export default Tetris;
