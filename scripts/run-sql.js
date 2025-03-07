
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

async function runSqlScript() {
  // Verificar la URL de la base de datos
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Error: La variable DATABASE_URL no está definida en el archivo .env');
    process.exit(1);
  }

  // Leer el archivo SQL
  const sqlScript = fs.readFileSync('./scripts/create-database.sql', 'utf8');

  // Conectar a la base de datos
  const pool = new Pool({
    connectionString: dbUrl,
  });

  try {
    console.log('Ejecutando script SQL...');
    await pool.query(sqlScript);
    console.log('Script SQL ejecutado correctamente');
  } catch (error) {
    console.error('Error al ejecutar el script SQL:', error.message);
  } finally {
    await pool.end();
  }
}

runSqlScript().catch(console.error);
