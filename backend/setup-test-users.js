/**
 * Setup test users: Hash passwords and update DB directly
 */
require('dotenv').config();
const bcrypt = require('bcrypt');

const useWindowsAuth = process.env.DB_AUTH === 'windows';
const sql = useWindowsAuth ? require('mssql/msnodesqlv8') : require('mssql');

const serverClean = (process.env.DB_SERVER || 'localhost').replace(/"/g, '').trim();
const serverParts = serverClean.split('\\').filter(Boolean);
const host = serverParts[0];
const instance = serverParts[1];

const dbConfig = {
  server: host,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 30000,
  },
  pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
};
if (instance) dbConfig.options.instanceName = instance;

async function setup() {
  console.log('Connecting to DB...');
  const pool = await sql.connect(dbConfig);
  console.log('Connected!');

  const teacherHash = await bcrypt.hash('Teacher@123', 10);
  const adminHash = await bcrypt.hash('Admin@123', 10);

  const r1 = await pool.request()
    .input('Hash', sql.NVarChar(500), teacherHash)
    .input('Email', sql.NVarChar(255), 'teacher@vocaboost.com')
    .query(`UPDATE Users SET PasswordHash = @Hash WHERE Email = @Email`);
  console.log(`teacher@vocaboost.com → updated ${r1.rowsAffected[0]} row(s)`);

  const r2 = await pool.request()
    .input('Hash', sql.NVarChar(500), adminHash)
    .input('Email', sql.NVarChar(255), 'system@vocaboost.com')
    .query(`UPDATE Users SET PasswordHash = @Hash WHERE Email = @Email`);
  console.log(`system@vocaboost.com  → updated ${r2.rowsAffected[0]} row(s)`);

  await pool.close();
  console.log('Done!');
  process.exit(0);
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
