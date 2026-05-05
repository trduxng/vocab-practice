require("dotenv").config();

const useWindowsAuth = process.env.DB_AUTH === "windows";
const sql = useWindowsAuth ? require("mssql/msnodesqlv8") : require("mssql");

const serverClean = (process.env.DB_SERVER || "localhost")
  .replace(/"/g, "")
  .trim();

const serverParts = serverClean.split("\\").filter(Boolean);
const host = serverParts[0];
const instance = serverParts[1];
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

const dbConfig = {
  server: host,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

if (instance) {
  dbConfig.options.instanceName = instance;
} else if (port) {
  dbConfig.port = port;
}

if (useWindowsAuth) {
  const driver = process.env.DB_ODBC_DRIVER || "ODBC Driver 17 for SQL Server";
  const server = instance ? `${host}\\${instance}` : port ? `${host},${port}` : host;

  dbConfig.driver = driver;
  dbConfig.connectionString = [
    `Driver={${driver}}`,
    `Server=${server}`,
    `Database=${process.env.DB_NAME}`,
    "Trusted_Connection=Yes",
  ].join(";");
  dbConfig.options.trustedConnection = true;
} else {
  dbConfig.user = process.env.DB_USER;
  dbConfig.password = process.env.DB_PASSWORD;
}

console.log("Connecting DB:", {
  server: dbConfig.server,
  instance: dbConfig.options.instanceName || null,
  port: dbConfig.port || null,
  database: dbConfig.database,
  auth: useWindowsAuth ? "windows" : "sql",
});

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("DB Connected");
    return pool;
  })
  .catch((err) => {
    console.error("Database Connection Failed:", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};
