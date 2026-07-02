package service

import (
	"context"
	"time"

	"github.com/vocab-practice/user-go/internal/model"
	"github.com/vocab-practice/user-go/internal/repository"
)

type AnalyticsService struct {
	progressRepo     *repository.ProgressRepo
	gamificationRepo *repository.GamificationRepo
}

func NewAnalyticsService(progressRepo *repository.ProgressRepo, gamificationRepo *repository.GamificationRepo) *AnalyticsService {
	return &AnalyticsService{
		progressRepo:     progressRepo,
		gamificationRepo: gamificationRepo,
	}
}

func (s *AnalyticsService) GetProgressAnalytics(ctx context.Context, userID int64) (*model.ProgressAnalytics, error) {
	activity, growth, topics, retention, err := s.progressRepo.GetProgressAnalytics(ctx, userID)
	if err != nil {
		return nil, err
	}

	totalXP, streak, _, _ := s.gamificationRepo.GetMetrics(ctx, userID)

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

	return &model.ProgressAnalytics{
		Summary:          summary,
		Activity:         activity,
		VocabularyGrowth: growth,
		TopicMastery:     topics,
		Retention:        retentionCalc,
	}, nil
}

func (s *AnalyticsService) GetMasteryTimeline(ctx context.Context, userID int64) (*model.MasteryTimeline, error) {
	timeline := &model.MasteryTimeline{}

	result, err := s.progressRepo.GetUserStatsForTimeline(ctx, userID)
	if err != nil {
		return nil, err
	}

	timeline.TotalWords = result.TotalWords
	timeline.MasteredWords = result.MasteredWords
	timeline.CompletionPct = result.CompletionPct

	// Estimate days to mastery based on current rate
	if result.TotalWords > 0 && result.AverageDailyRate > 0 {
		remaining := result.TotalWords - int(float64(result.TotalWords)*result.CompletionPct/100)
		days := int(float64(remaining) / result.AverageDailyRate)
		timeline.EstimatedDays = &days
		projected := time.Now().AddDate(0, 0, days)
		timeline.ProjectedDate = &projected
	}

	return timeline, nil
}
