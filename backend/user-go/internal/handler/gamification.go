package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vocab-practice/user-go/internal/service"
)

type GamificationHandler struct {
	gamificationSvc *service.GamificationService
}

func NewGamificationHandler(gamificationSvc *service.GamificationService) *GamificationHandler {
	return &GamificationHandler{gamificationSvc: gamificationSvc}
}

func (h *GamificationHandler) GetProfile(c *gin.Context) {
	userID := c.GetInt64("userId")
	profile, err := h.gamificationSvc.GetProfile(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load profile"})
		return
	}
	c.JSON(http.StatusOK, profile)
}

func (h *GamificationHandler) CompletePractice(c *gin.Context) {
	userID := c.GetInt64("userId")

	var req struct {
		SessionKey    string `json:"sessionKey"`
		TopicID       *int64 `json:"topicId"`
		CorrectCount  int    `json:"correctCount"`
		TotalAttempts int    `json:"totalAttempts"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.SessionKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing session key"})
		return
	}

	reward, err := h.gamificationSvc.AwardXP(c.Request.Context(), userID, "PracticeComplete", &req.SessionKey, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to award XP"})
		return
	}

	c.JSON(http.StatusOK, reward)
}

func (h *GamificationHandler) MarkAchievementsSeen(c *gin.Context) {
	userID := c.GetInt64("userId")

	var req struct {
		AchievementIDs []int64 `json:"achievementIds"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Dữ liệu không hợp lệ"})
		return
	}

	if err := h.gamificationSvc.MarkAchievementsSeen(c.Request.Context(), userID, req.AchievementIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Không thể cập nhật trạng thái đã xem"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đã đánh dấu thành tích đã xem"})
}
