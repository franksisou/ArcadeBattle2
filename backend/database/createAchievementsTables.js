// Script para crear tablas de logros
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../config/database');
const fs = require('fs');

async function createAchievementsTables() {
  try {
    console.log('📊 Creando tablas de logros...');
    
    const sqlPath = path.join(__dirname, 'create_achievements_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar cada statement por separado
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      await pool.query(statement);
    }
    
    console.log('✅ Tablas de logros creadas exitosamente');
    console.log('✅ Logros iniciales insertados');
    
    // Verificar
    const [achievements] = await pool.query('SELECT COUNT(*) as count FROM achievements');
    console.log(`📈 Total de logros disponibles: ${achievements[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    process.exit(1);
  }
}

createAchievementsTables();
