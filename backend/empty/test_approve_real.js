const { poolPromise, sql } = require('./src/config/db');
const ReviewService = require('./src/services/review.service');

async function run() {
  const pool = await poolPromise;
  console.log('Inserting temp topic in PendingReview...');
  const res = await pool.request()
    .query(`
      INSERT INTO Topics (TopicName, TopicCode, Description, ContentStatus, CreatedByUserID, CreatedAt, UpdatedAt)
      OUTPUT inserted.TopicID AS id
      VALUES ('Temp Topic Review', 'TEMP_REV_123', 'Temp description', 'PendingReview', 2, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
    `);
  const topicId = res.recordset[0].id;
  console.log('Inserted topicId:', topicId);

  try {
    console.log('Calling ReviewService.approve on topicId:', topicId);
    const ok = await ReviewService.approve('topic', topicId, 1);
    console.log('Approve result:', ok);
  } catch (err) {
    console.error('Approve failed with error:', err);
  } finally {
    console.log('Cleaning up temp topic...');
    await pool.request().input('ID', sql.BigInt, topicId).query('DELETE FROM Topics WHERE TopicID = @ID');
    console.log('Cleanup done');
  }
  process.exit(0);
}

run().catch(console.error);
