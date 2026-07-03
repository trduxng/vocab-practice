import "dotenv/config";

const useWindowsAuth = process.env.DB_AUTH === "windows";
const sqlModule = useWindowsAuth ? await import("mssql/msnodesqlv8") : await import("mssql");
const sql = sqlModule.default ?? sqlModule;

const serverClean = (process.env.DB_SERVER || "localhost")
  .replace(/"/g, "")
  .trim();

const serverParts = serverClean.split("\\").filter(Boolean);
const host = serverParts[0];
const instance = serverParts[1];
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

interface DbConfig {
  server: string;
  database?: string;
  user?: string;
  password?: string;
  port?: number;
  driver?: string;
  connectionString?: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    instanceName?: string;
    trustedConnection?: boolean;
  };
  pool: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
  };
}

const dbConfig: DbConfig = {
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

console.log("Admin service connecting DB:", {
  server: dbConfig.server,
  instance: dbConfig.options.instanceName || null,
  port: dbConfig.port || null,
  database: dbConfig.database,
  auth: useWindowsAuth ? "windows" : "sql",
});

const poolPromise = new sql.ConnectionPool(dbConfig).connect();

poolPromise
  .then(() => {
    console.log("Admin service DB connected");
  })
  .catch((err) => {
    console.error("Admin service database connection failed:", err);
  });

export { sql, poolPromise };
