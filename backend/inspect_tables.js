const { poolPromise } = require('./src/config/db');
poolPromise.then(pool => {
  const tables = ['ContentReviewLogs'];
  const promises = tables.map(t => {
    return pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${t}'`).then(res => {
      console.log(`=== ${t} Columns ===`);
      console.log(res.recordset.map(r => r.COLUMN_NAME).join(', '));
    });
  });
  return Promise.all(promises).then(() => process.exit(0));
}).catch(err => {
  console.error(err);
  process.exit(1);
});
