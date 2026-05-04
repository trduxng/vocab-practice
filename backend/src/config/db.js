// vocab-practice/backend/src/config/db.js
const sql = require("mssql");
const { config } = require("dotenv");

config(); // Load .env

const serverClean = (process.env.DB_SERVER || "").replace(/"/g, "");
const [host, instance] = serverClean.split("\\");

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: host,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    instanceName: instance,
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("DB Connected");
    return pool;
  })
  .catch((err) => {
    console.error("Database Connection Failed! Bad Config: ", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};
