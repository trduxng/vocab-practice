const { poolPromise } = require('./src/config/db');
poolPromise.then(pool => {
  return pool.request().query("SELECT * FROM dbo.TopicCategories").then(res => {
    console.log('All Categories:');
    console.log(res.recordset);
    process.exit(0);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
