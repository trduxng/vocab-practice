package service

import (
	"context"
	"fmt"
	"time"

	"github.com/vocab-practice/user-go/internal/model"
	"github.com/vocab-practice/user-go/internal/repository"
)

const (
	XPLearnWord        int64 = 10
	XPPracticeComplete int64 = 25
	XPMiniTestComplete int64 = 50
	XPDailyLogin       int64 = 5
)

type GamificationService struct {
	gamificationRepo *repository.GamificationRepo
	userRepo         *repository.UserRepo
}

func NewGamificationService(gamificationRepo *repository.GamificationRepo, userRepo *repository.UserRepo) *GamificationService {
	return &GamificationService{
		gamificationRepo: gamificationRepo,
		userRepo:         userRepo,
	}
}

var xpRewards = map[string]int64{
	"LearnWord":        XPLearnWord,
	"PracticeComplete": XPPracticeComplete,
	"MiniTestComplete": XPMiniTestComplete,
	"DailyLogin":       XPDailyLogin,
}

func (s *GamificationService) AwardXP(ctx context.Context, userID int64, eventType string, sourceKey, metadata *string) (*model.GamificationReward, error) {
	amount, ok := xpRewards[eventType]
	if !ok || amount == 0 {
		return nil, fmt.Errorf("unsupported XP event type: %s", eventType)
	}

	if err := s.gamificationRepo.EnsureSchema(ctx); err != nil {
		return nil, err
	}

	event := model.XPEvent{
		UserID:    userID,
		EventType: eventType,
		XPAmount:  amount,
		SourceKey: sourceKey,
		Metadata:  metadata,
		CreatedAt: time.Now(),
	}

	xpEventID, err := s.gamificationRepo.AwardXP(ctx, userID, event)
	if err != nil {
		return nil, err
	}

	profile, err := s.gamificationRepo.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	awarded := xpEventID > 0
	return &model.GamificationReward{
		XpEventID:      xpEventID,
		XpGained:       amount,
		EventType:      eventType,
		Awarded:        awarded,
		TotalXP:        profile.TotalXP,
		CurrentLevel:   profile.CurrentLevel,
		CurrentLevelXP: profile.TotalXP - int64(profile.CurrentLevel-1)*100,
		XpForNextLevel: profile.XpForNextLevel,
		LevelProgress:  profile.LevelProgress,
		Achievements:   []model.Achievement{},
	}, nil
}

func (s *GamificationService) GetProfile(ctx context.Context, userID int64) (*model.GamificationProfile, error) {
	return s.gamificationRepo.GetProfile(ctx, userID)
}

func (s *GamificationService) GetMetrics(ctx context.Context, userID int64) (totalXP int64, streak int, currentLevel int, err error) {
	return s.gamificationRepo.GetMetrics(ctx, userID)
}

func (s *GamificationService) MarkAchievementsSeen(ctx context.Context, userID int64, achievementIDs []int64) error {
	return s.gamificationRepo.MarkAchievementsSeen(ctx, userID, achievementIDs)
}

func (s *GamificationService) GetDateKey() string {
	return time.Now().Format("2006-01-02")
}
