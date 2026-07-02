package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/vocab-practice/user-go/internal/model"
)

type UserRepo struct {
	db *DB
}

func NewUserRepo(db *DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) GetByID(ctx context.Context, userID int64) (*model.User, error) {
	query := `SELECT UserID, FullName, Email, Role, DailyGoal, SRSReviewLimit,
		COALESCE(TotalXP, 0) AS TotalXP, COALESCE(CurrentLevel, 1) AS CurrentLevel, CreatedAt
		FROM Users WHERE UserID = @p1`

	user := &model.User{}
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&user.ID, &user.FullName, &user.Email, &user.Role,
		&user.DailyGoal, &user.SRSLimit, &user.TotalXP, &user.CurrentLevel, &user.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	return user, err
}

func (r *UserRepo) UpdateProfile(ctx context.Context, userID int64, fullName, email string) error {
	query := `UPDATE Users SET FullName = @p1, Email = @p2, UpdatedAt = SYSDATETIMEOFFSET()
		WHERE UserID = @p3`
	_, err := r.db.ExecContext(ctx, query, fullName, email, userID)
	return err
}

func (r *UserRepo) CheckEmailExists(ctx context.Context, email string, excludeUserID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM Users WHERE Email = @p1 AND UserID <> @p2`,
		email, excludeUserID).Scan(&count)
	return count > 0, err
}

func (r *UserRepo) GetPasswordHash(ctx context.Context, userID int64) (string, error) {
	var hash string
	err := r.db.QueryRowContext(ctx,
		`SELECT PasswordHash FROM Users WHERE UserID = @p1`, userID).Scan(&hash)
	return hash, err
}

func (r *UserRepo) UpdatePassword(ctx context.Context, userID int64, hash string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE Users SET PasswordHash = @p1, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @p2`,
		hash, userID)
	return err
}

func (r *UserRepo) GetDailyGoal(ctx context.Context, userID int64) (*model.DailyGoalSetting, error) {
	setting := &model.DailyGoalSetting{DailyGoal: 20, SRSLimit: 15}
	err := r.db.QueryRowContext(ctx,
		`SELECT DailyGoal, SRSReviewLimit FROM Users WHERE UserID = @p1`, userID,
	).Scan(&setting.DailyGoal, &setting.SRSLimit)
	if err == sql.ErrNoRows {
		return setting, nil
	}
	return setting, err
}

func (r *UserRepo) UpdateDailyGoal(ctx context.Context, userID int64, goal int) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE Users SET DailyGoal = @p1, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @p2`,
		goal, userID)
	return err
}

func (r *UserRepo) UpdateSRSLimit(ctx context.Context, userID int64, limit int) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE Users SET SRSReviewLimit = @p1, UpdatedAt = SYSDATETIMEOFFSET() WHERE UserID = @p2`,
		limit, userID)
	return err
}
