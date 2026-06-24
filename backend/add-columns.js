const { poolPromise } = require('./src/config/db');
poolPromise.then(pool => {
  return pool.request().query(`
    IF COL_LENGTH('dbo.Users', 'DailyGoal') IS NULL 
        ALTER TABLE dbo.Users ADD DailyGoal INT DEFAULT 20; 
    IF COL_LENGTH('dbo.Users', 'SRSReviewLimit') IS NULL 
        ALTER TABLE dbo.Users ADD SRSReviewLimit INT DEFAULT 15;
  `).then(() => {
    console.log('Columns DailyGoal and SRSReviewLimit added to Users table.');
    process.exit(0);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
