package repository

import (
	"context"
	"database/sql"

	"github.com/vocab-practice/user-go/internal/model"
)

type NotebookRepo struct {
	db *DB
}

func NewNotebookRepo(db *DB) *NotebookRepo {
	return &NotebookRepo{db: db}
}

func (r *NotebookRepo) EnsureSchema(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `
		IF OBJECT_ID(N'dbo.UserVocabularyNotebook', N'U') IS NULL
		BEGIN
			CREATE TABLE dbo.UserVocabularyNotebook (
				NotebookID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserVocabularyNotebook PRIMARY KEY,
				UserID BIGINT NOT NULL,
				WordID BIGINT NOT NULL,
				PersonalNote NVARCHAR(500) NULL,
				IsFavorite BIT NOT NULL CONSTRAINT DF_UserVocabularyNotebook_IsFavorite DEFAULT (0),
				AddedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_UserVocabularyNotebook_AddedAt DEFAULT (SYSDATETIMEOFFSET()),
				UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_UserVocabularyNotebook_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
				CONSTRAINT FK_UserVocabularyNotebook_UserID FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
				CONSTRAINT FK_UserVocabularyNotebook_WordID FOREIGN KEY (WordID) REFERENCES dbo.Words(WordID),
				CONSTRAINT UQ_UserVocabularyNotebook_UserWord UNIQUE (UserID, WordID)
			);
		END;
	`)
	return err
}

func (r *NotebookRepo) GetNotebook(ctx context.Context, userID int64, page, pageSize int) (*model.PaginatedResponse[model.NotebookEntry], error) {
	offset := (page - 1) * pageSize

	var total int
	if err := r.db.GetContext(ctx, &total,
		`SELECT COUNT(*) FROM UserVocabularyNotebook WHERE UserID = ?`, userID); err != nil {
		return nil, err
	}

	var entries []model.NotebookEntry
	if err := r.db.SelectContext(ctx, &entries, `
		SELECT un.NotebookID, un.UserID, un.WordID, un.PersonalNote, un.IsFavorite,
			un.AddedAt, un.UpdatedAt, w.Term, w.Meaning, w.Phonetic,
			p.PartOfSpeechName, ISNULL(uwp.MasteryLevel, 0) AS masteryLevel
		FROM UserVocabularyNotebook un
		JOIN Words w ON un.WordID = w.WordID
		LEFT JOIN PartOfSpeeches p ON w.PartOfSpeechID = p.PartOfSpeechID
		LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = ?
		WHERE un.UserID = ?
		ORDER BY un.IsFavorite DESC, un.UpdatedAt DESC
		OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`, userID, userID, offset, pageSize); err != nil {
		return nil, err
	}

	totalPages := (total + pageSize - 1) / pageSize
	return &model.PaginatedResponse[model.NotebookEntry]{
		Data: entries, Total: total, Page: page,
		PageSize: pageSize, TotalPages: totalPages,
	}, nil
}

func (r *NotebookRepo) AddEntry(ctx context.Context, userID, wordID int64, personalNote *string) (*model.NotebookEntry, error) {
	// Check if exists
	var existingID int64
	err := r.db.QueryRowContext(ctx,
		`SELECT NotebookID FROM UserVocabularyNotebook WHERE UserID = ? AND WordID = ?`,
		userID, wordID).Scan(&existingID)
	if err == nil {
		// Update existing
		_, err = r.db.ExecContext(ctx,
			`UPDATE UserVocabularyNotebook SET PersonalNote = COALESCE(?, PersonalNote),
				UpdatedAt = SYSDATETIMEOFFSET() WHERE NotebookID = ?`,
			personalNote, existingID)
		return r.GetByID(ctx, existingID)
	}

	var id int64
	err = r.db.QueryRowContext(ctx,
		`INSERT INTO UserVocabularyNotebook (UserID, WordID, PersonalNote, IsFavorite, AddedAt, UpdatedAt)
		 OUTPUT INSERTED.NotebookID
		 VALUES (?, ?, ?, 0, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`,
		userID, wordID, personalNote).Scan(&id)
	if err != nil {
		return nil, err
	}
	return r.GetByID(ctx, id)
}

func (r *NotebookRepo) GetByID(ctx context.Context, notebookID int64) (*model.NotebookEntry, error) {
	entry := &model.NotebookEntry{}
	err := r.db.QueryRowContext(ctx,
		`SELECT NotebookID, UserID, WordID, PersonalNote, IsFavorite, AddedAt, UpdatedAt
		 FROM UserVocabularyNotebook WHERE NotebookID = ?`, notebookID,
	).Scan(&entry.NotebookID, &entry.UserID, &entry.WordID, &entry.PersonalNote,
		&entry.IsFavorite, &entry.AddedAt, &entry.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return entry, err
}

func (r *NotebookRepo) UpdateEntry(ctx context.Context, notebookID, userID int64, personalNote *string, isFavorite *bool) (*model.NotebookEntry, error) {
	query := `UPDATE UserVocabularyNotebook SET UpdatedAt = SYSDATETIMEOFFSET()`
	args := []interface{}{}

	if personalNote != nil {
		query += `, PersonalNote = ?`
		args = append(args, *personalNote)
	}
	if isFavorite != nil {
		query += `, IsFavorite = ?`
		args = append(args, *isFavorite)
	}
	query += ` WHERE NotebookID = ? AND UserID = ?`
	args = append(args, notebookID, userID)

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	return r.GetByID(ctx, notebookID)
}

func (r *NotebookRepo) DeleteEntry(ctx context.Context, notebookID, userID int64) (int64, error) {
	result, err := r.db.ExecContext(ctx,
		`DELETE FROM UserVocabularyNotebook OUTPUT deleted.NotebookID
		 WHERE NotebookID = ? AND UserID = ?`, notebookID, userID)
	if err != nil {
		return 0, err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return 0, nil
	}
	return notebookID, nil
}

func (r *NotebookRepo) CheckEntry(ctx context.Context, userID, wordID int64) (*model.NotebookEntry, error) {
	entry := &model.NotebookEntry{}
	err := r.db.QueryRowContext(ctx,
		`SELECT un.NotebookID, un.WordID, un.PersonalNote, un.IsFavorite
		 FROM UserVocabularyNotebook un
		 WHERE un.UserID = ? AND un.WordID = ?`, userID, wordID,
	).Scan(&entry.NotebookID, &entry.WordID, &entry.PersonalNote, &entry.IsFavorite)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return entry, err
}
