const { sql, poolPromise } = require('./db');
require('dotenv').config();

async function runHealthCheck() {
  console.log('--- VOCABOOST SYSTEM DIAGNOSTIC ---');
  
  // 1. Check Env
  const requiredEnv = ['DB_SERVER', 'DB_NAME', 'JWT_SECRET'];
  const missing = requiredEnv.filter(k => !process.env[k]);
  
  if (missing.length > 0) {
    console.error('❌ MISSING ENV VARS:', missing.join(', '));
  } else {
    console.log('✅ Environment Variables: OK');
  }

  // 2. Check DB Connection
  try {
    const pool = await poolPromise;
    console.log('✅ Database Connection: OK');
    
    const tables = await pool.request().query("SELECT name FROM sys.tables");
    console.log(`✅ Database Schema: ${tables.recordset.length} tables found`);
  } catch (err) {
    console.error('❌ Database Connection: FAILED');
    console.error('   Error:', err.message);
  }

  console.log('-----------------------------------');
  process.exit(0);
}

runHealthCheck();
