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

app.use((req, res, next) => {
  console.log(`\n🌐 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  console.log('📋 Headers:', req.headers.authorization ? 'Token presente' : 'Sin token');
  next();
});

testConnection();

app.get('/', (req, res) => {
  res.json({ 
    message: '¡Servidor funcionando!',
    status: 'OK'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/achievements', achievementRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});