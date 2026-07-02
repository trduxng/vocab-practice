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

func (r *NotificationRepo) EnsureSchema(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `
		IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
		BEGIN
			CREATE TABLE dbo.Notifications (
				NotificationID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Notifications PRIMARY KEY,
				UserID BIGINT NOT NULL,
				Title NVARCHAR(200) NOT NULL,
				Message NVARCHAR(MAX) NOT NULL,
				Type NVARCHAR(50) NOT NULL CONSTRAINT DF_Notifications_Type DEFAULT (N'System'),
				DeliveryChannel NVARCHAR(20) NOT NULL CONSTRAINT DF_Notifications_DeliveryChannel DEFAULT (N'InApp'),
				ActionUrl NVARCHAR(500) NULL,
				IsRead BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT (0),
				CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
				CONSTRAINT FK_Notifications_UserID FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
			);
		END;
	`)
	return err
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
