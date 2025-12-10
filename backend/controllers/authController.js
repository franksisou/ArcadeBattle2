const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authController = {
  async register(req, res) {
    try {
      const { email, password, username } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const userId = await User.create({ email, password, username });
      
      const token = jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      await User.updateLastSession(userId);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: userId,
          email,
          username
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      const isPasswordValid = await User.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      await User.updateLastSession(user.id);

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getProfile(req, res) {
    try {
      res.json({
        user: req.user
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { username, email, currentPassword, newPassword } = req.body;

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ 
            error: 'Se requiere la contraseña actual para cambiarla' 
          });
        }

        const user = await User.findById(userId);
        
        const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ error: 'Contraseña actual incorrecta' });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({ 
            error: 'La nueva contraseña debe tener al menos 6 caracteres' 
          });
        }
      }

      if (email && email !== req.user.email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
          return res.status(400).json({ error: 'El email ya está en uso' });
        }
      }

      await User.updateProfile(userId, {
        username,
        email,
        newPassword
      });

      const updatedUser = await User.findById(userId);

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          fecha_registro: updatedUser.fecha_registro,
          ultima_sesion: updatedUser.ultima_sesion
        }
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;

      await User.deleteUserScores(userId);

      await User.deleteAccount(userId);

      res.json({
        message: 'Cuenta eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = authController;