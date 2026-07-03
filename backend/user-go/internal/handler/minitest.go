package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/vocab-practice/user-go/internal/model"
	"github.com/vocab-practice/user-go/internal/repository"
	"github.com/vocab-practice/user-go/internal/service"
)

type MiniTestHandler struct {
	minitestRepo    *repository.MiniTestRepo
	flashcardRepo   *repository.FlashcardRepo
	gamificationSvc *service.GamificationService
}

func NewMiniTestHandler(minitestRepo *repository.MiniTestRepo, flashcardRepo *repository.FlashcardRepo, gamificationSvc *service.GamificationService) *MiniTestHandler {
	return &MiniTestHandler{
		minitestRepo:    minitestRepo,
		flashcardRepo:   flashcardRepo,
		gamificationSvc: gamificationSvc,
	}
}

func (h *MiniTestHandler) GetMiniTests(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	result, err := h.minitestRepo.GetMiniTests(c.Request.Context(), page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load mini tests"})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *MiniTestHandler) GetMiniTestDetails(c *gin.Context) {
	testID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid test ID"})
		return
	}

	questions, err := h.minitestRepo.GetMiniTestDetails(c.Request.Context(), testID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load test details"})
		return
	}
	c.JSON(http.StatusOK, questions)
}

func (h *MiniTestHandler) GetTestHistory(c *gin.Context) {
	userID := c.GetInt64("userId")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	result, err := h.minitestRepo.GetTestHistory(c.Request.Context(), userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load test history"})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *MiniTestHandler) GetSessionDetails(c *gin.Context) {
	userID := c.GetInt64("userId")
	testID, err := strconv.ParseInt(c.Query("testId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid testId"})
		return
	}
	date := c.Query("date")
	if date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing date"})
		return
	}

	details, err := h.minitestRepo.GetSessionDetails(c.Request.Context(), userID, testID, date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load session details"})
		return
	}
	c.JSON(http.StatusOK, details)
}

func (h *MiniTestHandler) SubmitMiniTest(c *gin.Context) {
	userID := c.GetInt64("userId")
	testID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid test ID"})
		return
	}

	var req struct {
		Answers []struct {
			QuestionID      *int64 `json:"questionId"`
			WordID          *int64 `json:"wordId"`
			SubmittedAnswer string `json:"submittedAnswer"`
		} `json:"answers"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || len(req.Answers) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing answers"})
		return
	}

	// Check test is published
	published, err := h.minitestRepo.CheckTestPublished(c.Request.Context(), testID)
	if err != nil || !published {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Test not available"})
		return
	}

	// Check duplicate attempt
	duplicate, err := h.minitestRepo.CheckDuplicateAttempt(c.Request.Context(), userID, testID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check attempt"})
		return
	}
	if duplicate {
		c.JSON(http.StatusBadRequest, gin.H{"message": "You already completed this test"})
		return
	}

	// Get test questions
	questions, err := h.minitestRepo.GetTestQuestions(c.Request.Context(), testID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load test questions"})
		return
	}

	if len(questions) != len(req.Answers) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Answer count mismatch"})
		return
	}

	correctCount := 0
	submittedIDs := map[int64]bool{}
	results := make([]map[string]interface{}, 0, len(req.Answers))

	for i, ans := range req.Answers {
		qid := questions[i].QuestionID
		if ans.QuestionID != nil {
			qid = *ans.QuestionID
		}
		if submittedIDs[qid] {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Duplicate question submission"})
			return
		}
		submittedIDs[qid] = true

		isCorrect := false
		correctAnswer := questions[i].CorrectAnswer
		if ans.SubmittedAnswer != "" {
			isCorrect = normalize(ans.SubmittedAnswer) == normalize(correctAnswer)
		}
		if isCorrect {
			correctCount++
		}

		// Record attempt
		if questions[i].WordID != nil && *questions[i].WordID > 0 {
			wordID := *questions[i].WordID
			qid := questions[i].QuestionID
			h.flashcardRepo.SubmitAnswer(c.Request.Context(), userID, &qid, &wordID, ans.SubmittedAnswer, isCorrect, 0)
		}

		results = append(results, map[string]interface{}{
			"questionId": questions[i].QuestionID,
			"wordId":     questions[i].WordID,
			"isCorrect":  isCorrect,
		})
	}

	score := 0
	if len(req.Answers) > 0 {
		score = correctCount * 100 / len(req.Answers)
	}

	// Record attempt
	attemptID, err := h.minitestRepo.InsertMiniTestAttempt(c.Request.Context(), userID, testID, len(req.Answers), correctCount, float64(score))
	if err != nil {
		attemptID = 0
	}

	// Award XP
	var xpEarned int64
	var gamification *model.GamificationReward
	sourceKey := "mini-test-attempt:" + strconv.FormatInt(attemptID, 10)
	reward, err := h.gamificationSvc.AwardXP(c.Request.Context(), userID, "MiniTestComplete", &sourceKey, nil)
	if err == nil && reward != nil {
		xpEarned = reward.XpGained
		gamification = reward
	}

	c.JSON(http.StatusOK, gin.H{
		"total":        len(req.Answers),
		"correct":      correctCount,
		"score":        score,
		"xpEarned":     xpEarned,
		"gamification": gamification,
		"results":      results,
	})
}

func normalize(s string) string {
	result := make([]byte, 0, len(s))
	for i := 0; i < len(s); i++ {
		b := s[i]
		if b >= 'A' && b <= 'Z' {
			b += 32
		}
		if b != ' ' && b != '\t' && b != '\n' && b != '\r' {
			result = append(result, b)
		}
	}
	return string(result)
}


