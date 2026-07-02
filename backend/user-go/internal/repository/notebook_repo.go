package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/vocab-practice/user-go/internal/model"
)

type NotebookRepo struct {
	db *DB
}

func NewNotebookRepo(db *DB) *NotebookRepo {
	return &NotebookRepo{db: db}
}

func (r *NotebookRepo) GetNotebook(ctx context.Context, userID int64, page, pageSize int) (*model.PaginatedResponse[model.NotebookEntry], error) {
	offset := (page - 1) * pageSize

	var total int
	if err := r.db.GetContext(ctx, &total,
		`SELECT COUNT(*) FROM UserVocabularyNotebook WHERE UserID = @p1`, userID); err != nil {
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
		LEFT JOIN UserWordProgress uwp ON w.WordID = uwp.WordID AND uwp.UserID = @p1
		WHERE un.UserID = @p1
		ORDER BY un.IsFavorite DESC, un.UpdatedAt DESC
		OFFSET @p2 ROWS FETCH NEXT @p3 ROWS ONLY`, userID, offset, pageSize); err != nil {
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
		`SELECT NotebookID FROM UserVocabularyNotebook WHERE UserID = @p1 AND WordID = @p2`,
		userID, wordID).Scan(&existingID)
	if err == nil {
		// Update existing
		_, err = r.db.ExecContext(ctx,
			`UPDATE UserVocabularyNotebook SET PersonalNote = COALESCE(@p1, PersonalNote),
				UpdatedAt = SYSDATETIMEOFFSET() WHERE NotebookID = @p2`,
			personalNote, existingID)
		return r.GetByID(ctx, existingID)
	}

	var id int64
	err = r.db.QueryRowContext(ctx,
		`INSERT INTO UserVocabularyNotebook (UserID, WordID, PersonalNote, IsFavorite, AddedAt, UpdatedAt)
		 OUTPUT INSERTED.NotebookID
		 VALUES (@p1, @p2, @p3, 0, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())`,
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
		 FROM UserVocabularyNotebook WHERE NotebookID = @p1`, notebookID,
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
	argIdx := 1

	if personalNote != nil {
		query += fmt.Sprintf(", PersonalNote = @p%d", argIdx)
		args = append(args, *personalNote)
		argIdx++
	}
	if isFavorite != nil {
		query += fmt.Sprintf(", IsFavorite = @p%d", argIdx)
		args = append(args, *isFavorite)
		argIdx++
	}
	query += fmt.Sprintf(" WHERE NotebookID = @p%d AND UserID = @p%d", argIdx, argIdx+1)
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
		 WHERE NotebookID = @p1 AND UserID = @p2`, notebookID, userID)
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
		 WHERE un.UserID = @p1 AND un.WordID = @p2`, userID, wordID,
	).Scan(&entry.NotebookID, &entry.WordID, &entry.PersonalNote, &entry.IsFavorite)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return entry, err
}
