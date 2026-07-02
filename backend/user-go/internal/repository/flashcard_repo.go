package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/vocab-practice/user-go/internal/model"
)

type FlashcardRepo struct {
	db *DB
}

func NewFlashcardRepo(db *DB) *FlashcardRepo {
	return &FlashcardRepo{db: db}
}

func (r *FlashcardRepo) GetDueFlashcards(ctx context.Context, userID int64, filters model.FlashcardFilters) ([]model.Flashcard, error) {
	query := `
		DECLARE @Limit INT = ISNULL(
			(SELECT SRSReviewLimit FROM dbo.Users WHERE UserID = @p1), 15
		);
		SELECT TOP (@Limit)
			q.QuestionID AS questionId, q.QuestionType AS questionType,
			COALESCE(q.QuestionText, w.Meaning) AS questionText,
			COALESCE(q.CorrectAnswer, w.Term) AS correctAnswer,
			q.OptionsJson AS optionsJson,
			w.Phonetic AS phonetic, w.Meaning AS meaning, w.Term AS term,
			w.AudioUrlUK AS audioUrlUK, w.AudioUrlUS AS audioUrlUS,
			w.WordID AS wordId, p.PartOfSpeechName AS partOfSpeechName,
			ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
			ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus,
			ISNULL(uwp.RepetitionCount, 0) AS repetitionCount,
			ex.SentenceText AS exampleSentence, ex.SentenceTranslation AS exampleMeaning
		FROM Words w
		LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
		OUTER APPLY (
			SELECT TOP 1 QuestionID, QuestionType, QuestionText, CorrectAnswer, OptionsJson
			FROM Questions WHERE WordID = w.WordID AND ContentStatus = N'Published'
			ORDER BY QuestionID
		) q
		OUTER APPLY (
			SELECT TOP 1 SentenceText, SentenceTranslation
			FROM ExampleSentences WHERE WordID = w.WordID ORDER BY ExampleSentenceID
		) ex
		LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @p1
		WHERE w.ContentStatus = N'Published'
		ORDER BY
			CASE WHEN uwp.NextReviewDate <= SYSDATETIMEOFFSET() THEN 0
				 WHEN uwp.UserWordProgressID IS NOT NULL THEN 1 ELSE 2 END,
			uwp.NextReviewDate, uwp.MasteryLevel, NEWID()`

	var items []model.Flashcard
	if err := r.db.SelectContext(ctx, &items, query, userID); err != nil {
		return nil, fmt.Errorf("query flashcards: %w", err)
	}
	return items, nil
}

func (r *FlashcardRepo) GetTopicWords(ctx context.Context, userID, topicID int64) ([]model.TopicWord, error) {
	query := `
		SELECT w.WordID AS wordId, w.Term AS term, w.Meaning AS meaning,
			w.Phonetic AS phonetic, p.PartOfSpeechName AS partOfSpeechName,
			ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
			ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus,
			ISNULL(uwp.RepetitionCount, 0) AS repetitionCount,
			uwp.LastReviewedAt AS lastReviewedAt, uwp.NextReviewDate AS nextReviewDate,
			nb.NotebookID AS notebookId,
			CASE WHEN nb.NotebookID IS NULL THEN 0 ELSE 1 END AS isInNotebook,
			ex.SentenceText AS exampleSentence, ex.SentenceTranslation AS exampleMeaning
		FROM Topics t
		JOIN WordTopics wt ON wt.TopicID = t.TopicID
		JOIN Words w ON wt.WordID = w.WordID AND w.ContentStatus = N'Published'
		LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
		LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @p1
		LEFT JOIN UserVocabularyNotebook nb ON nb.WordID = w.WordID AND nb.UserID = @p1
		OUTER APPLY (
			SELECT TOP 1 SentenceText, SentenceTranslation
			FROM ExampleSentences WHERE WordID = w.WordID ORDER BY ExampleSentenceID
		) ex
		WHERE t.TopicID = @p2 AND t.ContentStatus = N'Published'
		ORDER BY w.Term ASC`

	var items []model.TopicWord
	if err := r.db.SelectContext(ctx, &items, query, userID, topicID); err != nil {
		return nil, fmt.Errorf("query topic words: %w", err)
	}
	return items, nil
}

func (r *FlashcardRepo) GetSmartReviewQueue(ctx context.Context, userID int64, limit int) ([]model.SmartReviewItem, error) {
	query := `
		SELECT TOP (@p2)
			w.WordID AS wordId, w.Term AS term, w.Phonetic AS phonetic,
			w.Meaning AS meaning, ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
			ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus,
			uwp.LastReviewedAt AS lastReviewedAt, uwp.NextReviewDate AS nextReviewDate,
			ISNULL(uwp.RepetitionCount, 0) AS repetitionCount,
			ISNULL(uwp.ConsecutiveWrong, 0) AS consecutiveWrong,
			CASE
				WHEN uwp.NextReviewDate IS NULL THEN 0
				WHEN uwp.NextReviewDate <= SYSDATETIMEOFFSET() THEN
					DATEDIFF(hour, uwp.NextReviewDate, SYSDATETIMEOFFSET()) *
					CASE WHEN uwp.ConsecutiveWrong > 0 THEN 3 ELSE 1 END
				ELSE DATEDIFF(hour, SYSDATETIMEOFFSET(), uwp.NextReviewDate) * -1
			END AS priorityScore
		FROM Words w
		JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @p1
		WHERE w.ContentStatus = N'Published'
			AND uwp.NextReviewDate <= DATEADD(day, 7, SYSDATETIMEOFFSET())
		ORDER BY priorityScore DESC, uwp.MasteryLevel ASC`

	var items []model.SmartReviewItem
	if err := r.db.SelectContext(ctx, &items, query, userID, limit); err != nil {
		return nil, fmt.Errorf("query smart review: %w", err)
	}
	return items, nil
}

func (r *FlashcardRepo) GetMistakeReviewQueue(ctx context.Context, userID int64, limit int) ([]model.MistakeReviewItem, error) {
	query := `
		SELECT TOP (@p2)
			w.WordID AS wordId, w.Term AS term, w.Meaning AS meaning,
			ISNULL(uwp.MasteryLevel, 0) AS masteryLevel,
			ISNULL(uwp.MemoryStatus, N'New') AS memoryStatus,
			ISNULL(uwp.ConsecutiveWrong, 0) AS consecutiveWrong,
			recent.wrongCount AS wrongCount
		FROM (
			SELECT WordID, COUNT(*) AS wrongCount
			FROM ExerciseAttempts
			WHERE UserID = @p1 AND IsCorrect = 0 AND WordID IS NOT NULL
			GROUP BY WordID HAVING COUNT(*) >= 1
		) recent
		JOIN Words w ON recent.WordID = w.WordID
		LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @p1
		ORDER BY recent.wrongCount DESC, uwp.MasteryLevel ASC`

	var items []model.MistakeReviewItem
	if err := r.db.SelectContext(ctx, &items, query, userID, limit); err != nil {
		return nil, fmt.Errorf("query mistake review: %w", err)
	}
	return items, nil
}

func (r *FlashcardRepo) SubmitAnswer(ctx context.Context, userID int64, questionID, wordID *int64, submittedAnswer string, isCorrect bool, scoreAwarded float64) (int64, error) {
	var canonicalWordID int64
	err := r.db.QueryRowContext(ctx,
		`EXEC usp_SubmitQuestionAttempt @UserID = @p1, @QuestionID = @p2, @SubmittedAnswer = @p3`,
		userID, questionID, submittedAnswer).Scan(&canonicalWordID)

	if canonicalWordID == 0 && wordID != nil {
		// Insert attempt directly
		_, err = r.db.ExecContext(ctx,
			`INSERT INTO ExerciseAttempts (UserID, QuestionID, WordID, SubmittedAnswer, IsCorrect, ScoreAwarded, AttemptedAt)
			 VALUES (@p1, @p2, @p3, @p4, @p5, @p6, SYSDATETIMEOFFSET())`,
			userID, questionID, wordID, submittedAnswer, isCorrect, scoreAwarded)
		return *wordID, err
	}

	return canonicalWordID, err
}

func (r *FlashcardRepo) UpdateWordProgress(ctx context.Context, userID, wordID int64, isCorrect bool, rating string) (*sql.Rows, error) {
	query := `
		MERGE UserWordProgress WITH (HOLDLOCK) AS target
		USING (SELECT @p1 AS UserID, @p2 AS WordID) AS source
		ON target.UserID = source.UserID AND target.WordID = source.WordID
		WHEN MATCHED THEN
			UPDATE SET MasteryLevel = CASE WHEN @p3 = 1 AND target.MasteryLevel < 10 THEN target.MasteryLevel + 1
					WHEN @p3 = 0 AND target.MasteryLevel > 0 THEN target.MasteryLevel - 1 ELSE target.MasteryLevel END,
				RepetitionCount = target.RepetitionCount + 1,
				ConsecutiveCorrect = CASE WHEN @p3 = 1 THEN target.ConsecutiveCorrect + 1 ELSE 0 END,
				ConsecutiveWrong = CASE WHEN @p3 = 0 THEN target.ConsecutiveWrong + 1 ELSE 0 END,
				LastReviewedAt = SYSDATETIMEOFFSET(),
				NextReviewDate = dbo.fn_CalculateNextReview(@p4, target.MasteryLevel, SYSDATETIMEOFFSET()),
				EaseFactor = dbo.fn_CalculateEaseFactor(@p4, target.EaseFactor),
				LastScore = CASE WHEN @p3 = 1 THEN 100.00 ELSE 0.00 END,
				MemoryStatus = dbo.fn_GetMemoryStatus(@p3, target.MasteryLevel),
				UpdatedAt = SYSDATETIMEOFFSET()
		WHEN NOT MATCHED THEN
			INSERT (UserID, WordID, MasteryLevel, EaseFactor, RepetitionCount, ConsecutiveCorrect, ConsecutiveWrong,
				LastReviewedAt, NextReviewDate, LastScore, MemoryStatus, CreatedAt, UpdatedAt)
			VALUES (@p1, @p2, CASE WHEN @p3 = 1 THEN 1 ELSE 0 END, 2.50, 1,
				CASE WHEN @p3 = 1 THEN 1 ELSE 0 END, CASE WHEN @p3 = 0 THEN 1 ELSE 0 END,
				SYSDATETIMEOFFSET(),
				dbo.fn_CalculateNextReview(@p4, CASE WHEN @p3 = 1 THEN 1 ELSE 0 END, SYSDATETIMEOFFSET()),
				CASE WHEN @p3 = 1 THEN 100.00 ELSE 0.00 END,
				CASE WHEN @p3 = 1 THEN N'Learning' ELSE N'Lapsed' END,
				SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
		OUTPUT inserted.MasteryLevel AS masteryLevel,
			inserted.MemoryStatus AS memoryStatus,
			inserted.NextReviewDate AS nextReviewDate;`

	return r.db.QueryContext(ctx, query, userID, wordID, isCorrect, rating)
}

func (r *FlashcardRepo) GetDailyProgress(ctx context.Context, userID int64) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM ExerciseAttempts
		 WHERE UserID = @p1 AND CAST(AttemptedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)`,
		userID).Scan(&count)
	return count, err
}

// scan helpers


