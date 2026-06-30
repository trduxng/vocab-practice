const fs = require('fs');
const path = require('path');
const { poolPromise } = require('./src/config/db');

async function run() {
  const sqlPath = path.join(__dirname, '..', 'Database', 'seed_diverse_topics.sql');
  let sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Remove USE ToeicVocabularyPlatform; and GO statements
  sqlContent = sqlContent.replace(/USE\s+ToeicVocabularyPlatform;/gi, '');
  
  const blocks = sqlContent.split(/\r?\nGO\r?\n/i);

  const pool = await poolPromise;
  console.log('Running seeding script...');
  for (let block of blocks) {
    block = block.trim();
    if (!block) continue;
    try {
      await pool.request().query(block);
    } catch (err) {
      console.error('Error executing SQL block:');
      console.error(block);
      console.error(err);
      process.exit(1);
    }
  }
  console.log('Seeding script executed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
