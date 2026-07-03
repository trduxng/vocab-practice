package repository

import (
	"context"

	"github.com/vocab-practice/user-go/internal/model"
)

type MiniTestRepo struct {
	db *DB
}

func NewMiniTestRepo(db *DB) *MiniTestRepo {
	return &MiniTestRepo{db: db}
}

func (r *MiniTestRepo) EnsureSchema(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `
		IF OBJECT_ID(N'dbo.MiniTestAttempts', N'U') IS NULL
		BEGIN
			CREATE TABLE dbo.MiniTestAttempts (
				MiniTestAttemptID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_MiniTestAttempts PRIMARY KEY,
				MiniTestID BIGINT NOT NULL,
				UserID BIGINT NOT NULL,
				StartedAt DATETIMEOFFSET(7) NOT NULL,
				SubmittedAt DATETIMEOFFSET(7) NULL,
				TotalQuestions INT NOT NULL,
				CorrectCount INT NOT NULL,
				Score DECIMAL(5,2) NOT NULL,
				CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_MiniTestAttempts_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
				CONSTRAINT FK_MiniTestAttempts_MiniTestID FOREIGN KEY (MiniTestID) REFERENCES dbo.MiniTests(MiniTestID),
				CONSTRAINT FK_MiniTestAttempts_UserID FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
			);
		END;
	`)
	return err
}

func (r *MiniTestRepo) GetMiniTests(ctx context.Context, page, pageSize int) (*model.PaginatedResponse[model.MiniTest], error) {
	offset := (page - 1) * pageSize

	var total int
	if err := r.db.GetContext(ctx, &total,
		`SELECT COUNT(*) FROM MiniTests WHERE IsPublished = 1`); err != nil {
		return nil, err
	}

	var tests []model.MiniTest
	if err := r.db.SelectContext(ctx, &tests, `
		SELECT mt.MiniTestID AS id, mt.TestTitle AS title, mt.Description AS description,
			t.TopicName AS topicName, t.TopicCode AS topicCode, mt.TotalQuestions AS totalQuestions
		FROM MiniTests mt
		LEFT JOIN Topics t ON mt.TopicID = t.TopicID
		WHERE mt.IsPublished = 1
		ORDER BY mt.CreatedAt DESC
		OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`, offset, pageSize); err != nil {
		return nil, err
	}

	totalPages := (total + pageSize - 1) / pageSize
	return &model.PaginatedResponse[model.MiniTest]{
		Data: tests, Total: total, Page: page,
		PageSize: pageSize, TotalPages: totalPages,
	}, nil
}

func (r *MiniTestRepo) GetMiniTestDetails(ctx context.Context, testID int64) ([]model.MiniTestQuestion, error) {
	var questions []model.MiniTestQuestion
	if err := r.db.SelectContext(ctx, &questions, `
		SELECT q.QuestionID AS questionId, q.QuestionType AS questionType,
			q.QuestionText AS questionText, q.OptionsJson AS optionsJson,
			q.CorrectAnswer AS correctAnswer, w.Term AS term, w.Meaning AS meaning
		FROM MiniTests mt
		JOIN MiniTestItems mti ON mti.MiniTestID = mt.MiniTestID
		JOIN Questions q ON mti.QuestionID = q.QuestionID AND q.ContentStatus = N'Published'
		JOIN Words w ON q.WordID = w.WordID AND w.ContentStatus = N'Published'
		WHERE mt.MiniTestID = ? AND mt.IsPublished = 1
		ORDER BY mti.DisplayOrder`, testID); err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *MiniTestRepo) GetTestHistory(ctx context.Context, userID int64, page, pageSize int) (*model.PaginatedResponse[model.TestHistoryItem], error) {
	offset := (page - 1) * pageSize

	var total int
	err := r.db.GetContext(ctx, &total, `
		SELECT COUNT(DISTINCT CAST(ea.AttemptedAt AS DATE) + CAST(mt.MiniTestID AS NVARCHAR))
		FROM ExerciseAttempts ea
		JOIN Questions q ON ea.QuestionID = q.QuestionID
		JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID
		JOIN MiniTests mt ON mti.MiniTestID = mt.MiniTestID
		WHERE ea.UserID = ?`, userID)
	if err != nil {
		return nil, err
	}

	var history []model.TestHistoryItem
	if err := r.db.SelectContext(ctx, &history, `
		SELECT CAST(ea.AttemptedAt AS DATE) AS date, mt.MiniTestID AS testId, mt.TestTitle AS testTitle,
			COUNT(*) AS totalQuestions,
			SUM(CASE WHEN ea.IsCorrect = 1 THEN 1 ELSE 0 END) AS correctAnswers
		FROM ExerciseAttempts ea
		JOIN Questions q ON ea.QuestionID = q.QuestionID
		JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID
		JOIN MiniTests mt ON mti.MiniTestID = mt.MiniTestID
		WHERE ea.UserID = ?
		GROUP BY CAST(ea.AttemptedAt AS DATE), mt.TestTitle, mt.MiniTestID
		ORDER BY date DESC
		OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`, userID, offset, pageSize); err != nil {
		return nil, err
	}

	totalPages := (total + pageSize - 1) / pageSize
	return &model.PaginatedResponse[model.TestHistoryItem]{
		Data: history, Total: total, Page: page,
		PageSize: pageSize, TotalPages: totalPages,
	}, nil
}

func (r *MiniTestRepo) GetSessionDetails(ctx context.Context, userID, testID int64, date string) ([]model.TestSessionDetail, error) {
	var details []model.TestSessionDetail
	if err := r.db.SelectContext(ctx, &details, `
		SELECT q.QuestionText AS questionText, q.QuestionType AS questionType,
			q.OptionsJson AS optionsJson, q.CorrectAnswer AS correctAnswer,
			ea.SubmittedAnswer AS submittedAnswer, ea.IsCorrect AS isCorrect,
			w.Term AS term, w.Meaning AS meaning
		FROM ExerciseAttempts ea
		JOIN Questions q ON ea.QuestionID = q.QuestionID
		JOIN MiniTestItems mti ON q.QuestionID = mti.QuestionID
		JOIN Words w ON q.WordID = w.WordID
		WHERE ea.UserID = ? AND mti.MiniTestID = ? AND CAST(ea.AttemptedAt AS DATE) = ?`,
		userID, testID, date); err != nil {
		return nil, err
	}
	return details, nil
}

func (r *MiniTestRepo) CheckTestPublished(ctx context.Context, testID int64) (bool, error) {
	var published bool
	err := r.db.QueryRowContext(ctx,
		`SELECT IsPublished FROM MiniTests WHERE MiniTestID = ?`, testID).Scan(&published)
	return published, err
}

func (r *MiniTestRepo) GetTestQuestions(ctx context.Context, testID int64) ([]QuestionWithWord, error) {
	var questions []QuestionWithWord
	if err := r.db.SelectContext(ctx, &questions, `
		SELECT q.QuestionID, q.WordID, q.CorrectAnswer
		FROM MiniTestItems mti
		JOIN Questions q ON q.QuestionID = mti.QuestionID AND q.ContentStatus = N'Published'
		WHERE mti.MiniTestID = ?`, testID); err != nil {
		return nil, err
	}
	return questions, nil
}

type QuestionWithWord struct {
	QuestionID   int64
	WordID       *int64
	CorrectAnswer string
}

func (r *MiniTestRepo) CheckDuplicateAttempt(ctx context.Context, userID, testID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM MiniTestAttempts
		 WHERE MiniTestID = ? AND UserID = ? AND SubmittedAt IS NOT NULL`,
		testID, userID).Scan(&count)
	return count > 0, err
}

func (r *MiniTestRepo) InsertMiniTestAttempt(ctx context.Context, userID, testID int64, total, correct int, score float64) (int64, error) {
	var id int64
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO MiniTestAttempts (MiniTestID, UserID, StartedAt, SubmittedAt, TotalQuestions, CorrectCount, Score)
		OUTPUT inserted.MiniTestAttemptID
		VALUES (?, ?, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), ?, ?, ?)`,
		testID, userID, total, correct, score).Scan(&id)
	return id, err
}
