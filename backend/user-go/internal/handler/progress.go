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
	gamification, _ := h.gamificationRepo.GetProfile(c.Request.Context(), userID)

	accuracy := 0
	total := correct + wrong
	if total > 0 {
		accuracy = int(float64(correct) * 100.0 / float64(total))
	}

	stats := model.DashboardStats{
		TotalLearned:   learned,
		Accuracy:       accuracy,
		Correct:        correct,
		Wrong:          wrong,
		Streak:         gamification.Streak,
		TotalXP:        gamification.TotalXP,
		CurrentLevel:   gamification.CurrentLevel,
		LevelProgress:  gamification.LevelProgress,
		TodayXP:        gamification.TodayXP,
		WeakWords:      weakWords,
		RecentAttempts: recentAttempts,
		DailyTrends:    dailyTrends,
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

func (h *ProgressHandler) GetSessionSummary(c *gin.Context) {
	userID := c.GetInt64("userId")

	var totalAttempts, correctCount, wrongCount int
	var accuracy float64
	var xpEarned int64
	var totalXP int64
	var currentLevel int

	db := h.progressRepo.GetDB()

	err := db.QueryRowContext(c.Request.Context(), `
		SELECT
			ISNULL(COUNT(*), 0),
			ISNULL(SUM(CASE WHEN IsCorrect = 1 THEN 1 ELSE 0 END), 0),
			ISNULL(SUM(CASE WHEN IsCorrect = 0 THEN 1 ELSE 0 END), 0)
		FROM ExerciseAttempts
		WHERE UserID = @p1 AND CAST(AttemptedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)`,
		userID).Scan(&totalAttempts, &correctCount, &wrongCount)
	if err == nil && totalAttempts > 0 {
		accuracy = float64(correctCount) * 100.0 / float64(totalAttempts)
	}

	db.QueryRowContext(c.Request.Context(),
		`SELECT ISNULL(SUM(XPAmount), 0) FROM UserXPEvents
		 WHERE UserID = @p1 AND CAST(CreatedAt AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)`,
		userID).Scan(&xpEarned)
	db.QueryRowContext(c.Request.Context(),
		`SELECT COALESCE(TotalXP, 0), COALESCE(CurrentLevel, 1) FROM Users WHERE UserID = @p1`,
		userID).Scan(&totalXP, &currentLevel)

	weakWords, _ := h.progressRepo.GetWeakWords(c.Request.Context(), userID)

	c.JSON(http.StatusOK, model.SessionSummary{
		TotalAttempts: totalAttempts,
		CorrectCount:  correctCount,
		WrongCount:    wrongCount,
		Accuracy:      accuracy,
		XPEarned:      xpEarned,
		TotalXP:       totalXP,
		CurrentLevel:  currentLevel,
		WeakWords:     weakWords,
	})
}
