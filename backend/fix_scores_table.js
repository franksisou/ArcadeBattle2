// Script para verificar y corregir la estructura de la tabla scores
const { pool } = require('./config/database');

async function fixScoresTable() {
  try {
    console.log('Verificando estructura de la tabla scores...');
    
    // Verificar las columnas actuales
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM scores
    `);
    
    console.log('Columnas actuales:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    const hasPlayedAt = columns.some(col => col.Field === 'played_at');
    const hasFechaRegistro = columns.some(col => col.Field === 'fecha_registro');
    
    if (hasFechaRegistro && !hasPlayedAt) {
      console.log('\n⚠️  Encontrada columna "fecha_registro", renombrando a "played_at"...');
      
      await pool.query(`
        ALTER TABLE scores 
        CHANGE COLUMN fecha_registro played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      
      console.log('✅ Columna renombrada exitosamente');
    } else if (hasPlayedAt) {
      console.log('\n✅ La tabla ya tiene la columna "played_at"');
    } else {
      console.log('\n❌ No se encontró ninguna columna de fecha');
    }
    
    // Verificar índices
    console.log('\nVerificando índices...');
    const [indexes] = await pool.query(`
      SHOW INDEX FROM scores
    `);
    
    console.log('Índices actuales:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.Key_name} en columna ${idx.Column_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixScoresTable();
