// backend/routes/scores.js
const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Guardar nueva puntuación
router.post('/', scoreController.saveScore);

// Obtener leaderboard global (antes de otras rutas con parámetros)
router.get('/leaderboard', scoreController.getGlobalLeaderboard);

// Obtener puntuaciones recientes
router.get('/recent', scoreController.getRecentScores);

// Obtener estadísticas del usuario autenticado
router.get('/user/stats', scoreController.getUserStats);

// Obtener puntuaciones del usuario autenticado
router.get('/user/scores', scoreController.getUserScores);

// Obtener mejor puntuación del usuario en un juego específico
router.get('/user/:game', scoreController.getUserBestScore);

// Obtener leaderboard de un juego específico
router.get('/leaderboard/:game', scoreController.getGameLeaderboard);

module.exports = router;
