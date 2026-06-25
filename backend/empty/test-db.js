const { poolPromise } = require("./src/config/db");

async function testDatabaseConnection() {
  console.log("--- DIAGNOSTIC START ---");

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT DB_NAME() AS databaseName, SUSER_SNAME() AS loginName");

    console.log("SUCCESS: Connected to SQL Server!");
    console.log("Database:", result.recordset[0].databaseName);
    console.log("Login:", result.recordset[0].loginName);

    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error("FAIL: Connection Error");
    console.error("Code:", err.code);
    console.error("Message:", err.message);
    process.exit(1);
  }
}

testDatabaseConnection();
