// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 Middleware de autenticación iniciado');
    console.log('📍 Ruta:', req.method, req.path);
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🎫 Token recibido:', token ? 'Sí' : 'No');
    
    if (!token) {
      console.log('❌ Token no proporcionado');
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado, userId:', decoded.userId);
    
    const user = await User.findById(decoded.userId);
    console.log('👤 Usuario encontrado:', user ? user.username : 'No');
    
    if (!user) {
      console.log('❌ Usuario no encontrado en BD');
      return res.status(401).json({ error: 'Token inválido. Usuario no encontrado.' });
    }

    req.user = user;
    console.log('✅ Autenticación exitosa, continuando...');
    next();
  } catch (error) {
    console.error('❌ Error en middleware de autenticación:', error.message);
    res.status(401).json({ error: 'Token inválido.' });
  }
};

module.exports = authMiddleware;