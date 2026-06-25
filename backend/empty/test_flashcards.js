// Test the flashcards endpoint specifically to find what's causing 500
const { poolPromise, sql } = require('./src/config/db');

async function test() {
  const pool = await poolPromise;
  
  // Test getDueFlashcards for user ID 3 (user2@gmail.com - Learner)
  try {
    console.log('Testing getDueFlashcards query for userId=3...');
    const result = await pool.request()
      .input('UserID', sql.BigInt, 3)
      .input('TopicID', sql.BigInt, null)
      .input('Mode', sql.NVarChar(20), '')
      .query(`
        DECLARE @Limit INT = ISNULL(
          (SELECT SRSReviewLimit FROM dbo.Users WHERE UserID = @UserID),
          15
        );
        DECLARE @NewTopicID BIGINT = @TopicID;

        IF @NewTopicID IS NULL
        BEGIN
          SELECT TOP (1) @NewTopicID = ute.TopicID
          FROM dbo.UserTopicEnrollments ute
          JOIN dbo.Topics enrolledTopic ON enrolledTopic.TopicID = ute.TopicID
          WHERE ute.UserID = @UserID
            AND ute.IsActive = 1
            AND enrolledTopic.ContentStatus = N'Published'
          ORDER BY ute.EnrolledAt, ute.TopicID;
        END;

        SELECT TOP (@Limit)
          q.QuestionID AS questionId,
          q.QuestionType AS questionType,
          COALESCE(q.QuestionText, w.Meaning) AS questionText,
          COALESCE(q.CorrectAnswer, w.Term) AS correctAnswer,
          q.OptionsJson AS optionsJson,
          w.Phonetic AS phonetic,
          w.Meaning AS meaning,
          w.Term AS term,
          w.AudioUrlUK AS audioUrlUK,
          w.AudioUrlUS AS audioUrlUS,
          w.ImageUrl AS imageUrl,
          w.WordID AS wordId,
          p.PartOfSpeechName AS partOfSpeechName,
          ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
          ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus,
          ISNULL(uwp.RepetitionCount, 0) AS repetitionCount,
          ex.SentenceText AS exampleSentence,
          ex.SentenceTranslation AS exampleMeaning
        FROM Words w
        LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
        OUTER APPLY (
          SELECT TOP 1
            QuestionID,
            QuestionType,
            QuestionText,
            CorrectAnswer,
            OptionsJson
          FROM Questions
          WHERE WordID = w.WordID
            AND ContentStatus = N'Published'
          ORDER BY QuestionID
        ) q
        OUTER APPLY (
          SELECT TOP 1 SentenceText, SentenceTranslation
          FROM ExampleSentences
          WHERE WordID = w.WordID
          ORDER BY ExampleSentenceID
        ) ex
        LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @UserID
        WHERE w.ContentStatus = N'Published'
          AND (
            (@TopicID IS NOT NULL AND EXISTS (
              SELECT 1 FROM WordTopics wt
              WHERE wt.WordID = w.WordID AND wt.TopicID = @TopicID
            ))
            OR
            (@TopicID IS NULL AND (
              uwp.UserWordProgressID IS NOT NULL
              OR EXISTS (
                SELECT 1 FROM WordTopics wt
                WHERE wt.WordID = w.WordID AND wt.TopicID = @NewTopicID
              )
            ))
          )
          AND (
            (@Mode = N'new' AND ISNULL(uwp.RepetitionCount, 0) = 0)
            OR
            (@Mode = N'learned' AND uwp.UserWordProgressID IS NOT NULL)
            OR
            (@Mode NOT IN (N'new', N'learned') AND (uwp.NextReviewDate IS NULL OR uwp.NextReviewDate <= SYSDATETIMEOFFSET()))
          )
        ORDER BY
          CASE
            WHEN uwp.NextReviewDate <= SYSDATETIMEOFFSET() THEN 0
            WHEN uwp.UserWordProgressID IS NOT NULL THEN 1
            ELSE 2
          END,
          uwp.NextReviewDate,
          uwp.MasteryLevel,
          NEWID()
      `);
    console.log('SUCCESS: got', result.recordset.length, 'flashcards');
  } catch (err) {
    console.error('FAILED:', err.message);
    console.error('LineNumber:', err.lineNumber);
  }
  
  // Check required tables
  console.log('\nChecking tables...');
  for (const table of ['UserTopicEnrollments', 'UserWordProgress', 'WordTopics', 'ExampleSentences', 'PartOfSpeeches']) {
    try {
      const r = await pool.request().query(`SELECT TOP 1 * FROM ${table}`);
      console.log(`  ${table}: EXISTS (${r.recordset.length} sample rows)`);
    } catch (e) {
      console.error(`  ${table}: ERROR - ${e.message}`);
    }
  }
  
  process.exit(0);
}

test().catch(err => {
  console.error('Uncaught:', err);
  process.exit(1);
});
