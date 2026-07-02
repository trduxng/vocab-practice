const { poolPromise } = require('./src/config/db');
poolPromise.then(pool => {
  return pool.request().query("SELECT UserID, FullName, Email, UserRole FROM dbo.Users").then(res => {
    console.log('All Users:');
    console.log(res.recordset);
    process.exit(0);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
