// Script para eliminar puntuaciones duplicadas
const { pool } = require('./config/database');

async function removeDuplicateScores() {
  try {
    console.log('🔍 Buscando puntuaciones duplicadas...\n');
    
    // Encontrar duplicados (mismo usuario, juego, score y fecha muy cercana)
    const [duplicates] = await pool.query(`
      SELECT 
        s1.id,
        s1.user_id,
        s1.game,
        s1.score,
        s1.played_at,
        COUNT(*) as count
      FROM scores s1
      INNER JOIN scores s2 ON 
        s1.user_id = s2.user_id AND
        s1.game = s2.game AND
        s1.score = s2.score AND
        ABS(TIMESTAMPDIFF(SECOND, s1.played_at, s2.played_at)) < 2 AND
        s1.id < s2.id
      GROUP BY s1.id, s1.user_id, s1.game, s1.score, s1.played_at
      HAVING count > 0
    `);
    
    if (duplicates.length === 0) {
      console.log('✅ No se encontraron puntuaciones duplicadas');
      process.exit(0);
    }
    
    console.log(`⚠️  Se encontraron ${duplicates.length} grupos de duplicados\n`);
    
    // Para cada grupo de duplicados, mantener solo el primero y eliminar los demás
    for (const dup of duplicates) {
      console.log(`Procesando duplicado: User ${dup.user_id}, Game ${dup.game}, Score ${dup.score}`);
      
      // Encontrar todos los IDs duplicados
      const [allDuplicates] = await pool.query(`
        SELECT id, played_at
        FROM scores
        WHERE user_id = ? 
          AND game = ? 
          AND score = ?
          AND ABS(TIMESTAMPDIFF(SECOND, played_at, ?)) < 2
        ORDER BY id ASC
      `, [dup.user_id, dup.game, dup.score, dup.played_at]);
      
      if (allDuplicates.length > 1) {
        // Mantener el primero, eliminar los demás
        const toDelete = allDuplicates.slice(1).map(d => d.id);
        console.log(`  Manteniendo ID ${allDuplicates[0].id}, eliminando: ${toDelete.join(', ')}`);
        
        await pool.query(`
          DELETE FROM scores WHERE id IN (?)
        `, [toDelete]);
      }
    }
    
    console.log('\n✅ Duplicados eliminados exitosamente');
    
    // Mostrar resumen
    const [total] = await pool.query('SELECT COUNT(*) as count FROM scores');
    console.log(`\n📊 Total de puntuaciones restantes: ${total[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

removeDuplicateScores();
