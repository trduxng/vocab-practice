package repository

import (
	"context"
	"fmt"

	"github.com/vocab-practice/user-go/internal/model"
)

type NotificationRepo struct {
	db *DB
}

func NewNotificationRepo(db *DB) *NotificationRepo {
	return &NotificationRepo{db: db}
}

func (r *NotificationRepo) GetNotifications(ctx context.Context, userID int64, limit int) (*model.NotificationResponse, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT TOP (@p2)
			NotificationID, Title, Message, Type, DeliveryChannel,
			IsRead, ActionUrl, CreatedAt
		FROM dbo.Notifications
		WHERE UserID = @p1
		ORDER BY IsRead ASC, CreatedAt DESC`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []model.Notification
	for rows.Next() {
		var n model.Notification
		if err := rows.Scan(&n.ID, &n.Title, &n.Message, &n.Type, &n.Channel,
			&n.IsRead, &n.ActionUrl, &n.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan notification: %w", err)
		}
		notifications = append(notifications, n)
	}

	var unreadCount, total int
	r.db.QueryRowContext(ctx,
		`SELECT COUNT(*), SUM(CASE WHEN IsRead = 0 THEN 1 ELSE 0 END)
		 FROM dbo.Notifications WHERE UserID = @p1`, userID).Scan(&total, &unreadCount)

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
