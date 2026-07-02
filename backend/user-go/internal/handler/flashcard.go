package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/vocab-practice/user-go/internal/model"
	"github.com/vocab-practice/user-go/internal/repository"
)

type FlashcardHandler struct {
	flashcardRepo *repository.FlashcardRepo
}

func NewFlashcardHandler(flashcardRepo *repository.FlashcardRepo) *FlashcardHandler {
	return &FlashcardHandler{flashcardRepo: flashcardRepo}
}

func (h *FlashcardHandler) GetDueFlashcards(c *gin.Context) {
	userID := c.GetInt64("userId")
	topicIDStr := c.Query("topicId")
	mode := c.Query("mode")

	filters := model.FlashcardFilters{Mode: mode, Limit: 20}
	if topicIDStr != "" {
		tid, _ := strconv.ParseInt(topicIDStr, 10, 64)
		filters.TopicID = &tid
	}

	flashcards, err := h.flashcardRepo.GetDueFlashcards(c.Request.Context(), userID, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load flashcards"})
		return
	}
	c.JSON(http.StatusOK, flashcards)
}

func (h *FlashcardHandler) GetTopicWords(c *gin.Context) {
	userID := c.GetInt64("userId")
	topicID, err := strconv.ParseInt(c.Param("topicId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid topic ID"})
		return
	}

	words, err := h.flashcardRepo.GetTopicWords(c.Request.Context(), userID, topicID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load topic words"})
		return
	}
	c.JSON(http.StatusOK, words)
}

func (h *FlashcardHandler) GetSmartReviewQueue(c *gin.Context) {
	userID := c.GetInt64("userId")
	limit := 20
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 50 {
			limit = l
		}
	}

	queue, err := h.flashcardRepo.GetSmartReviewQueue(c.Request.Context(), userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load review queue"})
		return
	}
	c.JSON(http.StatusOK, queue)
}

func (h *FlashcardHandler) GetMistakeReviewQueue(c *gin.Context) {
	userID := c.GetInt64("userId")
	limit := 10
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 30 {
			limit = l
		}
	}

	queue, err := h.flashcardRepo.GetMistakeReviewQueue(c.Request.Context(), userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load mistake queue"})
		return
	}
	c.JSON(http.StatusOK, queue)
}

func (h *FlashcardHandler) GetDailyProgress(c *gin.Context) {
	userID := c.GetInt64("userId")
	count, err := h.flashcardRepo.GetDailyProgress(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load daily progress"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"todayCount": count})
}
