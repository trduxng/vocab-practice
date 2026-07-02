const { poolPromise } = require('./src/config/db');
poolPromise.then(async (pool) => {
  try {
    const topics = await pool.request().query('SELECT COUNT(*) AS count FROM Topics');
    const words = await pool.request().query('SELECT COUNT(*) AS count FROM Words');
    const questions = await pool.request().query('SELECT COUNT(*) AS count FROM Questions');
    const tests = await pool.request().query('SELECT COUNT(*) AS count FROM MiniTests');
    console.log('--- COUNTS ---');
    console.log('Topics:', topics.recordset[0].count);
    console.log('Words:', words.recordset[0].count);
    console.log('Questions:', questions.recordset[0].count);
    console.log('MiniTests:', tests.recordset[0].count);
    
    console.log('--- LATEST 5 WORDS ---');
    const latestWords = await pool.request().query('SELECT TOP 5 WordID, Term, Phonetic, Meaning FROM Words ORDER BY WordID DESC');
    console.log(latestWords.recordset);
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
