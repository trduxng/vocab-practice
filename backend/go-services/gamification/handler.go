package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// Handler wraps Store and exposes HTTP handlers.
type Handler struct {
	store *Store
}

// NewHandler creates a new Handler.
func NewHandler(store *Store) *Handler {
	return &Handler{store: store}
}

// HealthCheck returns service health.
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "gamification-service",
		"timestamp": nowISO(),
	})
}

// GetProfile returns the full gamification profile.
func (h *Handler) GetProfile(c *gin.Context) {
	userID, err := parseUserID(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid userId"})
		return
	}

	profile, err := h.store.GetProfile(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": fmt.Sprintf("Failed to get profile: %v", err)})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// GetMetrics returns gamification metrics.
func (h *Handler) GetMetrics(c *gin.Context) {
	userID, err := parseUserID(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid userId"})
		return
	}

	m, err := h.store.GetMetrics(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": fmt.Sprintf("Failed to get metrics: %v", err)})
		return
	}

	c.JSON(http.StatusOK, m)
}

// GetAchievements returns all achievements with user progress.
func (h *Handler) GetAchievements(c *gin.Context) {
	userID, err := parseUserID(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid userId"})
		return
	}

	m, err := h.store.GetMetrics(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": fmt.Sprintf("Failed to get metrics: %v", err)})
		return
	}

	achievements, err := h.store.GetAchievements(c.Request.Context(), userID, m)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": fmt.Sprintf("Failed to get achievements: %v", err)})
		return
	}

	c.JSON(http.StatusOK, achievements)
}

// AwardXP awards XP to a user.
func (h *Handler) AwardXP(c *gin.Context) {
	var req AwardXPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request: " + err.Error()})
		return
	}

	// Determine XP amount
	baseAmount, exists := XP_REWARDS[req.EventType]
	finalAmount := baseAmount
	if req.XPAmount != nil && *req.XPAmount > 0 {
		finalAmount = *req.XPAmount
	} else if req.Amount != nil && *req.Amount > 0 {
		finalAmount = *req.Amount
	}

	if !exists && finalAmount == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("Unsupported XP event type: %s", req.EventType)})
		return
	}

	sourceKey := ""
	if req.SourceKey != nil {
		sourceKey = *req.SourceKey
	}

	var metadataJSON *string
	if req.Metadata != nil {
		b, _ := json.Marshal(req.Metadata)
		s := string(b)
		metadataJSON = &s
	}

	result, err := h.store.AwardXP(c.Request.Context(), req.UserID, req.EventType, finalAmount, sourceKey, metadataJSON)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": fmt.Sprintf("Failed to award XP: %v", err)})
		return
	}

	ls := GetLevelState(int(result.TotalXP.Int64))

	// Check achievements if XP was actually awarded
	var unlockedAchievements []Achievement
	if result.XPGained.Int64 > 0 && req.EventType != "AchievementUnlock" {
		m, err := h.store.GetMetrics(c.Request.Context(), req.UserID)
		if err == nil {
			newAchievements, err := h.store.CheckAchievements(c.Request.Context(), req.UserID, m)
			if err == nil && newAchievements != nil {
				unlockedAchievements = newAchievements
			}
		}
	}

	resp := AwardXPResponse{
		XPEventID:            int(result.XPEventID.Int64),
		XPGained:             int(result.XPGained.Int64),
		EventType:            req.EventType,
		Awarded:              result.XPGained.Int64 > 0,
		UnlockedAchievements: unlockedAchievements,
		LevelState:           ls,
	}

	c.JSON(http.StatusOK, resp)
}

// AwardDailyLogin awards daily login XP.
func (h *Handler) AwardDailyLogin(c *gin.Context) {
	userID, err := parseUserID(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid userId"})
		return
	}

	dateKey := dateKey()
	sourceKey := fmt.Sprintf("daily-login:%s", dateKey)

	result, err := h.store.AwardXP(c.Request.Context(), userID, "DailyLogin", 5, sourceKey, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": fmt.Sprintf("Failed to award daily login: %v", err)})
		return
	}

	ls := GetLevelState(int(result.TotalXP.Int64))

	c.JSON(http.StatusOK, AwardXPResponse{
		XPEventID:  int(result.XPEventID.Int64),
		XPGained:   int(result.XPGained.Int64),
		EventType:  "DailyLogin",
		Awarded:    result.XPGained.Int64 > 0,
		LevelState: ls,
	})
}

// MarkAchievementsSeen marks achievements as seen.
func (h *Handler) MarkAchievementsSeen(c *gin.Context) {
	var req MarkSeenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request: " + err.Error()})
		return
	}

	if err := h.store.MarkAchievementsSeen(c.Request.Context(), req.UserID, req.AchievementIDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": fmt.Sprintf("Failed to mark achievements seen: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đã đánh dấu đã đọc"})
}

// ComputeLevelState calculates level state from totalXP (pure computation, no DB).
func (h *Handler) ComputeLevelState(c *gin.Context) {
	totalXPStr := c.Query("totalXP")
	totalXP, err := strconv.Atoi(totalXPStr)
	if err != nil {
		totalXP = 0
	}

	ls := GetLevelState(totalXP)
	c.JSON(http.StatusOK, ls)
}

// nowISO returns current UTC time in ISO format.
func nowISO() string {
	return time.Now().UTC().Format("2006-01-02T15:04:05.000Z")
}

func dateKey() string {
	return time.Now().UTC().Format("2006-01-02")
}

func parseUserID(s string) (int64, error) {
	return strconv.ParseInt(s, 10, 64)
}
