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

  // Check if teacher exists
  const checkTeacher = await pool.request()
    .input('Email', sql.NVarChar(255), 'teacher@vocaboost.com')
    .query('SELECT UserID FROM Users WHERE Email = @Email');

  if (checkTeacher.recordset.length === 0) {
    await pool.request()
      .input('Email', sql.NVarChar(255), 'teacher@vocaboost.com')
      .input('Hash', sql.NVarChar(500), teacherHash)
      .input('UserRole', sql.NVarChar(50), 'ContentCreator')
      .input('RoleID', sql.Int, 3)
      .query(`
        INSERT INTO Users (FullName, Email, PasswordHash, UserRole, IsActive, RoleID, TotalXP, CurrentLevel)
        VALUES ('Teacher Test', @Email, @Hash, @UserRole, 1, @RoleID, 0, 1)
      `);
    console.log('Inserted teacher@vocaboost.com');
  } else {
    await pool.request()
      .input('Email', sql.NVarChar(255), 'teacher@vocaboost.com')
      .input('Hash', sql.NVarChar(500), teacherHash)
      .query('UPDATE Users SET PasswordHash = @Hash WHERE Email = @Email');
    console.log('Updated teacher@vocaboost.com password');
  }

  // Check if admin exists
  const checkAdmin = await pool.request()
    .input('Email', sql.NVarChar(255), 'system@vocaboost.com')
    .query('SELECT UserID FROM Users WHERE Email = @Email');

  if (checkAdmin.recordset.length === 0) {
    await pool.request()
      .input('Email', sql.NVarChar(255), 'system@vocaboost.com')
      .input('Hash', sql.NVarChar(500), adminHash)
      .input('UserRole', sql.NVarChar(50), 'Admin')
      .input('RoleID', sql.Int, 1)
      .query(`
        INSERT INTO Users (FullName, Email, PasswordHash, UserRole, IsActive, RoleID, TotalXP, CurrentLevel)
        VALUES ('Admin Test', @Email, @Hash, @UserRole, 1, @RoleID, 0, 1)
      `);
    console.log('Inserted system@vocaboost.com');
  } else {
    await pool.request()
      .input('Email', sql.NVarChar(255), 'system@vocaboost.com')
      .input('Hash', sql.NVarChar(500), adminHash)
      .query('UPDATE Users SET PasswordHash = @Hash WHERE Email = @Email');
    console.log('Updated system@vocaboost.com password');
  }

  // Also let's update password for creator@gmail.com and admin@gmail.com to hash them properly just in case
  const defaultHash = await bcrypt.hash('123', 10);
  await pool.request()
    .input('Hash', sql.NVarChar(500), defaultHash)
    .query("UPDATE Users SET PasswordHash = @Hash WHERE Email IN ('creator@gmail.com', 'user2@gmail.com') AND PasswordHash = '123'");
  console.log('Updated default plain-text passwords');

  await pool.close();
  console.log('Done!');
  process.exit(0);
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
