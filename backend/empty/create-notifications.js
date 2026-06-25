const { poolPromise } = require('./src/config/db');
poolPromise.then(pool => {
  return pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Notifications' and xtype='U')
    CREATE TABLE dbo.Notifications (
      NotificationID BIGINT IDENTITY(1,1) PRIMARY KEY,
      UserID BIGINT NOT NULL,
      Title NVARCHAR(200) NOT NULL,
      Message NVARCHAR(MAX) NOT NULL,
      Type VARCHAR(50) DEFAULT 'System',
      DeliveryChannel VARCHAR(50) DEFAULT 'InApp',
      ActionUrl NVARCHAR(500) NULL,
      IsRead BIT DEFAULT 0,
      CreatedAt DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
    );
  `).then(() => {
    console.log('Table Notifications created or already exists.');
    process.exit(0);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
