// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/scores');
const achievementRoutes = require('./routes/achievements');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  console.log(`\n🌐 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  console.log('📋 Headers:', req.headers.authorization ? 'Token presente' : 'Sin token');
  next();
});

// Probar conexión
testConnection();

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '¡Servidor funcionando!',
    status: 'OK'
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de puntuaciones
app.use('/api/scores', scoreRoutes);

// Rutas de logros
app.use('/api/achievements', achievementRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});