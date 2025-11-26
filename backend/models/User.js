// backend/models/User.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Crear nuevo usuario
  static async create(userData) {
    const { email, password, username } = userData;
    
    // Hash de la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO usuarios (email, password, username) 
      VALUES (?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [email, hashedPassword, username]);
    return result.insertId;
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0];
  }

  // Buscar usuario por ID
  static async findById(id) {
    const query = 'SELECT id, email, username, fecha_registro, ultima_sesion, estado FROM usuarios WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Actualizar última sesión
  static async updateLastSession(userId) {
    const query = 'UPDATE usuarios SET ultima_sesion = NOW() WHERE id = ?';
    await pool.execute(query, [userId]);
  }

  // Actualizar perfil
  static async updateProfile(userId, { username, email, newPassword }) {
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const query = 'UPDATE usuarios SET username = ?, email = ?, password = ? WHERE id = ?';
      await pool.execute(query, [username, email, hashedPassword, userId]);
    } else {
      const query = 'UPDATE usuarios SET username = ?, email = ? WHERE id = ?';
      await pool.execute(query, [username, email, userId]);
    }
  }

  // Eliminar puntuaciones del usuario
  static async deleteUserScores(userId) {
    const query = 'DELETE FROM scores WHERE user_id = ?';
    await pool.execute(query, [userId]);
  }

  // Eliminar cuenta
  static async deleteAccount(userId) {
    const query = 'DELETE FROM usuarios WHERE id = ?';
    await pool.execute(query, [userId]);
  }
}

module.exports = User;