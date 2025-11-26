// backend/routes/achievements.js
const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los logros disponibles
router.get('/', achievementController.getAllAchievements);

// Obtener logros del usuario autenticado
router.get('/user', achievementController.getUserAchievements);

// Obtener logros recientes
router.get('/recent', achievementController.getRecentAchievements);

// Verificar y desbloquear nuevos logros
router.post('/check', achievementController.checkAchievements);

module.exports = router;
