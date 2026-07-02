package repository

import (
	"context"

	"github.com/vocab-practice/user-go/internal/model"
)

type NotificationRepo struct {
	db *DB
}

func NewNotificationRepo(db *DB) *NotificationRepo {
	return &NotificationRepo{db: db}
}

func (r *NotificationRepo) GetNotifications(ctx context.Context, userID int64, limit int) (*model.NotificationResponse, error) {
	var notifications []model.Notification
	if err := r.db.SelectContext(ctx, &notifications, `
		SELECT TOP (@p2)
			NotificationID AS id, Title AS title, Message AS message,
			Type AS type, DeliveryChannel AS channel,
			IsRead AS isRead, ActionUrl AS actionUrl, CreatedAt AS createdAt
		FROM dbo.Notifications
		WHERE UserID = @p1
		ORDER BY IsRead ASC, CreatedAt DESC`, userID, limit); err != nil {
		return nil, err
	}

	var unreadCount, total int
	r.db.GetContext(ctx, &total,
		`SELECT COUNT(*) FROM dbo.Notifications WHERE UserID = @p1`, userID)
	r.db.GetContext(ctx, &unreadCount,
		`SELECT ISNULL(SUM(CASE WHEN IsRead = 0 THEN 1 ELSE 0 END), 0) FROM dbo.Notifications WHERE UserID = @p1`, userID)

	return &model.NotificationResponse{
		Notifications: notifications,
		UnreadCount:   unreadCount,
		Total:         total,
	}, nil
}

func (r *NotificationRepo) MarkRead(ctx context.Context, userID, notificationID int64) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE dbo.Notifications SET IsRead = 1
		 WHERE NotificationID = @p1 AND UserID = @p2`,
		notificationID, userID)
	return err
}

func (r *NotificationRepo) MarkAllRead(ctx context.Context, userID int64) (int, error) {
	result, err := r.db.ExecContext(ctx,
		`UPDATE dbo.Notifications SET IsRead = 1
		 WHERE UserID = @p1 AND IsRead = 0`, userID)
	if err != nil {
		return 0, err
	}
	rows, _ := result.RowsAffected()
	return int(rows), nil
}
