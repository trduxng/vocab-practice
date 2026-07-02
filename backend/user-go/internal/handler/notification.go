package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/vocab-practice/user-go/internal/repository"
)

type NotificationHandler struct {
	notificationRepo *repository.NotificationRepo
}

func NewNotificationHandler(notificationRepo *repository.NotificationRepo) *NotificationHandler {
	return &NotificationHandler{notificationRepo: notificationRepo}
}

func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID := c.GetInt64("userId")
	limit := 50
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	result, err := h.notificationRepo.GetNotifications(c.Request.Context(), userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load notifications"})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *NotificationHandler) MarkRead(c *gin.Context) {
	userID := c.GetInt64("userId")
	notifID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid notification ID"})
		return
	}

	if err := h.notificationRepo.MarkRead(c.Request.Context(), userID, notifID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to mark notification"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	userID := c.GetInt64("userId")
	count, err := h.notificationRepo.MarkAllRead(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to mark notifications"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "count": count})
}
