const { poolPromise, sql } = require('./src/config/db');

async function test() {
  const pool = await poolPromise;
  
  // First insert a topic to update
  console.log('Inserting test topic...');
  const insertRes = await pool.request()
    .query(`
      INSERT INTO Topics (TopicName, TopicCode, Description, ContentStatus, CreatedByUserID, CreatedAt, UpdatedAt)
      OUTPUT inserted.TopicID AS id
      VALUES ('Test Topic For Update', 'TUPD_TEST', 'Test desc', 'Draft', 2, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
    `);
  const topicId = insertRes.recordset[0].id;
  console.log('Inserted topicId:', topicId);

  try {
    console.log('Testing UPDATE query...');
    const result = await pool.request()
      .input('TopicID', sql.BigInt, topicId)
      .input('UserID', sql.BigInt, 2)
      .input('TopicName', sql.NVarChar(200), 'Updated name')
      .input('TopicCode', sql.NVarChar(50), null)
      .input('Description', sql.NVarChar(1000), 'Updated desc')
      .input('TopicCategoryID', sql.BigInt, null)
      .query(`
        UPDATE Topics
        SET TopicName = ISNULL(@TopicName, TopicName),
            TopicCode = ISNULL(@TopicCode, TopicCode),
            Description = ISNULL(@Description, Description),
            TopicCategoryID = ISNULL(@TopicCategoryID, TopicCategoryID),
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE TopicID = @TopicID AND CreatedByUserID = @UserID
      `);
    console.log('UPDATE succeeded, rowsAffected:', result.rowsAffected);
  } catch (err) {
    console.error('UPDATE failed with error:');
    console.error('Message:', err.message);
    console.error('Number:', err.number);
    console.error('LineNumber:', err.lineNumber);
  } finally {
    await pool.request()
      .input('ID', sql.BigInt, topicId)
      .query('DELETE FROM Topics WHERE TopicID = @ID');
    console.log('Cleaned up topic');
  }
  
  process.exit(0);
}

test().catch(err => {
  console.error('Uncaught:', err);
  process.exit(1);
});
