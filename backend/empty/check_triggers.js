const { poolPromise } = require('./src/config/db');
poolPromise.then(async pool => {
  const result = await pool.request().query(`
    SELECT t.name AS TriggerName, tb.name AS TableName, t.is_disabled
    FROM sys.triggers t
    JOIN sys.tables tb ON t.parent_id = tb.object_id
  `);
  console.log('Triggers:');
  console.log(result.recordset);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
