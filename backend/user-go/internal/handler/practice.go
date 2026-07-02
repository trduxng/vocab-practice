package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/vocab-practice/user-go/internal/repository"
	"github.com/vocab-practice/user-go/internal/service"
)

type PracticeHandler struct {
	flashcardRepo     *repository.FlashcardRepo
	minitestRepo      *repository.MiniTestRepo
	gamificationRepo  *repository.GamificationRepo
	srs               *service.SRSService
	gamificationSvc   *service.GamificationService
}

func NewPracticeHandler(
	flashcardRepo *repository.FlashcardRepo,
	minitestRepo *repository.MiniTestRepo,
	gamificationRepo *repository.GamificationRepo,
	gamificationSvc *service.GamificationService,
) *PracticeHandler {
	return &PracticeHandler{
		flashcardRepo:    flashcardRepo,
		minitestRepo:     minitestRepo,
		gamificationRepo: gamificationRepo,
		srs:              service.NewSRSService(),
		gamificationSvc:  gamificationSvc,
	}
}

func (h *PracticeHandler) SubmitAnswer(c *gin.Context) {
	userID := c.GetInt64("userId")

	var req struct {
		QuestionID      *int64  `json:"questionId"`
		WordID          *int64  `json:"wordId"`
		SubmittedAnswer string  `json:"submittedAnswer"`
		IsCorrect       bool    `json:"isCorrect"`
		ReviewRating    *string `json:"reviewRating"`
		ActivityType    string  `json:"activityType"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	if req.QuestionID == nil && req.WordID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing questionId or wordId"})
		return
	}

	var canonicalWordID int64
	var err error

	if req.QuestionID != nil {
		canonicalWordID, err = h.flashcardRepo.SubmitAnswer(
			c.Request.Context(), userID, req.QuestionID, req.WordID,
			req.SubmittedAnswer, req.IsCorrect, 0,
		)
	} else if req.WordID != nil {
		canonicalWordID = *req.WordID
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to submit answer"})
		return
	}

	// Update SRS word progress
	var nextReviewDate string
	var masteryLevel int
	var memoryStatus string

	if canonicalWordID > 0 && req.ReviewRating != nil {
		rows, err := h.flashcardRepo.UpdateWordProgress(
			c.Request.Context(), userID, canonicalWordID, req.IsCorrect, *req.ReviewRating,
		)
		if err == nil && rows != nil {
			defer rows.Close()
			if rows.Next() {
				var nextReview interface{}
				rows.Scan(&masteryLevel, &memoryStatus, &nextReview)
			}
		}
	}

	// Award XP for learning activity
	var xpGained int64
	if req.ActivityType == "LearnWord" {
		dateKey := h.gamificationSvc.GetDateKey()
		sourceKey := "learn-word:" + strconv.FormatInt(canonicalWordID, 10) + ":" + dateKey
		reward, err := h.gamificationSvc.AwardXP(c.Request.Context(), userID, "LearnWord", &sourceKey, nil)
		if err == nil && reward != nil {
			xpGained = reward.XpGained
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Answer recorded",
		"xpGained":     xpGained,
		"masteryLevel": masteryLevel,
		"memoryStatus": memoryStatus,
		"reviewRating": req.ReviewRating,
		"nextReviewDate": nextReviewDate,
	})
}
