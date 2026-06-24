const { poolPromise } = require('./src/config/db');
poolPromise.then(pool => {
  return pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users'").then(res => {
    console.log('Columns:');
    console.log(res.recordset);
    return pool.request().query("SELECT TOP 5 * FROM dbo.Users").then(res2 => {
      console.log('Rows:');
      console.log(res2.recordset);
      process.exit(0);
    });
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
