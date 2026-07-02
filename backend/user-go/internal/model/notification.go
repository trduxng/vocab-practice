package model

import "time"

type Notification struct {
	ID        int64     `json:"id" db:"id"`
	Title     string    `json:"title" db:"title"`
	Message   string    `json:"message" db:"message"`
	Type      string    `json:"type" db:"type"`
	Channel   string    `json:"channel" db:"channel"`
	IsRead    bool      `json:"isRead" db:"isRead"`
	ActionUrl *string   `json:"actionUrl" db:"actionUrl"`
	CreatedAt time.Time `json:"createdAt" db:"createdAt"`
}

type NotificationResponse struct {
	Notifications []Notification `json:"notifications"`
	UnreadCount   int            `json:"unreadCount"`
	Total         int            `json:"total"`
}
