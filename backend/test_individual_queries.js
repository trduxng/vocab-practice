const { poolPromise } = require('./src/config/db');
poolPromise.then(async pool => {
  try {
    console.log('Testing topic update query...');
    const result = await pool.request()
      .input('TopicID', 1)
      .input('UserID', 2)
      .input('TopicName', 'Updated test')
      .input('TopicCode', null)
      .input('Description', null)
      .input('TopicCategoryID', null)
      .query(`
        UPDATE Topics
        SET TopicName = ISNULL(@TopicName, TopicName),
            TopicCode = ISNULL(@TopicCode, TopicCode),
            Description = ISNULL(@Description, Description),
            TopicCategoryID = ISNULL(@TopicCategoryID, TopicCategoryID),
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE TopicID = @TopicID AND CreatedByUserID = @UserID
      `);
    console.log('Update query succeeded!', result.rowsAffected);
  } catch (err) {
    console.error('Update query failed:', err);
  }

  try {
    console.log('Testing topic approve query...');
    // Let's see what the approve query in review.service.js line 67 does:
    // UPDATE Topics SET ContentStatus = 'Published', UpdatedAt = SYSDATETIMEOFFSET(), ReviewedByUserID = 1, ReviewedAt = SYSDATETIMEOFFSET() WHERE TopicID = 1 AND ContentStatus = 'PendingReview'
    const result = await pool.request()
      .input('ID', 1)
      .input('AdminID', 1)
      .query(`
        UPDATE Topics
        SET ContentStatus = 'Published', UpdatedAt = SYSDATETIMEOFFSET(), ReviewedByUserID = @AdminID, ReviewedAt = SYSDATETIMEOFFSET()
        WHERE TopicID = @ID AND ContentStatus = 'PendingReview'
      `);
    console.log('Approve query succeeded!', result.rowsAffected);
  } catch (err) {
    console.error('Approve query failed:', err);
  }

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
