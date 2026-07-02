const { poolPromise } = require('./src/config/db');
poolPromise.then(pool => {
  return pool.request().query("SELECT TopicID, TopicName, TopicCode, ContentStatus, TopicCategoryID, CreatedByUserID FROM dbo.Topics").then(res => {
    console.log('All Topics:');
    console.log(res.recordset);
    process.exit(0);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
