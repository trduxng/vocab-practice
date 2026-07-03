package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/vocab-practice/user-go/internal/model"
	"github.com/vocab-practice/user-go/internal/repository"
)

type ProgressHandler struct {
	progressRepo     *repository.ProgressRepo
	gamificationRepo *repository.GamificationRepo
}

func NewProgressHandler(progressRepo *repository.ProgressRepo, gamificationRepo *repository.GamificationRepo) *ProgressHandler {
	return &ProgressHandler{
		progressRepo:     progressRepo,
		gamificationRepo: gamificationRepo,
	}
}

func (h *ProgressHandler) GetStats(c *gin.Context) {
	userID := c.GetInt64("userId")

	learned, correct, wrong, _, _ := h.progressRepo.GetUserStats(c.Request.Context(), userID)
	weakWords, _ := h.progressRepo.GetWeakWords(c.Request.Context(), userID)
	recentAttempts, _ := h.progressRepo.GetRecentAttempts(c.Request.Context(), userID)
	dailyTrends, _ := h.progressRepo.GetDailyTrends(c.Request.Context(), userID)
	gamification, err := h.gamificationRepo.GetProfile(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load profile", "error": err.Error()})
		return
	}

	accuracy := 0
	total := correct + wrong
	if total > 0 {
		accuracy = int(float64(correct) * 100.0 / float64(total))
	}

	stats := model.DashboardStats{
		TotalLearned:    learned,
		Accuracy:        accuracy,
		Correct:         correct,
		Wrong:           wrong,
		Streak:          gamification.Streak,
		TotalXP:         gamification.TotalXP,
		CurrentLevel:    gamification.CurrentLevel,
		CurrentLevelXP:  gamification.CurrentLevelXP,
		XpForNextLevel:  gamification.XpForNextLevel,
		XpToNextLevel:   gamification.XpToNextLevel,
		LevelProgress:   gamification.LevelProgress,
		TodayXP:         gamification.TodayXP,
		WeakWords:       weakWords,
		RecentAttempts:  recentAttempts,
		DailyTrends:     dailyTrends,
	}

	c.JSON(http.StatusOK, stats)
}

func (h *ProgressHandler) GetProgressAnalytics(c *gin.Context) {
	userID := c.GetInt64("userId")

	activity, growth, topics, retention, err := h.progressRepo.GetProgressAnalytics(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load analytics"})
		return
	}

	totalXP, streak, _, _ := h.gamificationRepo.GetMetrics(c.Request.Context(), userID)

	activeDays := 0
	for _, day := range activity {
		if day.ActivityCount > 0 {
			activeDays++
		}
	}

	summary := model.ProgressSummary{
		ActiveDays:    activeDays,
		TotalXP:       totalXP,
		CurrentStreak: streak,
		LearnedWords:  retention.LearnedWords,
		MasteredWords: retention.MasteredWords,
	}

	retentionCalc := model.RetentionCalculated{
		TotalAnswers:   retention.TotalAnswers,
		CorrectAnswers: retention.CorrectAnswers,
		LearnedWords:   retention.LearnedWords,
		ForgottenWords: retention.ForgottenWords,
		UpToDateWords:  retention.UpToDateWords,
	}
	retentionCalc.CorrectAnswerRate = model.CalculatePercentage(retention.CorrectAnswers, retention.TotalAnswers)
	retentionCalc.ForgottenWordRate = model.CalculatePercentage(retention.ForgottenWords, retention.LearnedWords)
	retentionCalc.ReviewCompletionRate = model.CalculatePercentage(retention.UpToDateWords, retention.LearnedWords)

	analytics := model.ProgressAnalytics{
		Summary:          summary,
		Activity:         activity,
		VocabularyGrowth: growth,
		TopicMastery:     topics,
		Retention:        retentionCalc,
	}

	c.JSON(http.StatusOK, analytics)
}

func (h *ProgressHandler) GetActivityHeatmap(c *gin.Context) {
	userID := c.GetInt64("userId")
	year := time.Now().Year()
	if yearStr := c.Query("year"); yearStr != "" {
		if y, err := strconv.Atoi(yearStr); err == nil {
			year = y
		}
	}

	data, err := h.progressRepo.GetActivityHeatmap(c.Request.Context(), userID, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load heatmap"})
		return
	}
	c.JSON(http.StatusOK, data)
}

func (h *ProgressHandler) GetMasteryTimeline(c *gin.Context) {
	userID := c.GetInt64("userId")

	timeline, err := h.progressRepo.GetMasteryTimeline(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load mastery timeline"})
		return
	}

	c.JSON(http.StatusOK, timeline)
}

func (h *ProgressHandler) GetSessionSummary(c *gin.Context) {
	userID := c.GetInt64("userId")

	totalAttempts, correctCount, wrongCount, err := h.progressRepo.GetSessionSummary(c.Request.Context(), userID)

	var accuracy float64
	if err == nil && totalAttempts > 0 {
		accuracy = float64(correctCount) * 100.0 / float64(totalAttempts)
	}

	profile, _ := h.gamificationRepo.GetProfile(c.Request.Context(), userID)
	var totalXP int64
	var currentLevel int
	var todayXP int64
	if profile != nil {
		totalXP = profile.TotalXP
		currentLevel = profile.CurrentLevel
		todayXP = profile.TodayXP
	}

	weakWords, _ := h.progressRepo.GetWeakWords(c.Request.Context(), userID)

	c.JSON(http.StatusOK, model.SessionSummary{
		TotalAttempts: totalAttempts,
		CorrectCount:  correctCount,
		WrongCount:    wrongCount,
		Accuracy:      accuracy,
		XPEarned:      todayXP,
		TotalXP:       totalXP,
		CurrentLevel:  currentLevel,
		WeakWords:     weakWords,
	})
}
