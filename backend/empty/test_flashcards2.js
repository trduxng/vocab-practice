const { poolPromise } = require('./src/config/db');

async function test() {
  const pool = await poolPromise;
  
  // Check all published words
  const words = await pool.request().query("SELECT COUNT(*) AS cnt FROM Words WHERE ContentStatus = 'Published'");
  console.log('Published words:', words.recordset[0].cnt);
  
  // Check UserWordProgress
  const uwp = await pool.request().query("SELECT COUNT(*) AS cnt FROM UserWordProgress");
  console.log('UserWordProgress rows:', uwp.recordset[0].cnt);
  
  // Check WordTopics
  const wt = await pool.request().query("SELECT COUNT(*) AS cnt FROM WordTopics");
  console.log('WordTopics rows:', wt.recordset[0].cnt);
  
  // Check if any words exist for login user
  const r = await pool.request().query(`
    SELECT TOP 5 w.WordID, w.Term, w.ContentStatus 
    FROM Words w
    LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = 3
    WHERE w.ContentStatus = 'Published'
  `);
  console.log('Sample published words:', r.recordset);
  
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
