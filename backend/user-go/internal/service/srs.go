package service

import (
	"math"
	"time"

	"github.com/vocab-practice/user-go/internal/model"
)

type SRSService struct{}

func NewSRSService() *SRSService {
	return &SRSService{}
}

func (s *SRSService) NextInterval(rating model.ReviewGrade, masteryLevel int, easeFactor float64) time.Duration {
	switch rating {
	case model.GradeAgain:
		return 10 * time.Minute
	case model.GradeHard:
		return 24 * time.Hour
	case model.GradeGood:
		return s.goodInterval(masteryLevel, easeFactor)
	case model.GradeEasy:
		return s.easyInterval(masteryLevel, easeFactor)
	default:
		return s.goodInterval(masteryLevel, easeFactor)
	}
}

func (s *SRSService) goodInterval(masteryLevel int, _ float64) time.Duration {
	days := 1
	switch {
	case masteryLevel >= 8:
		days = 14
	case masteryLevel >= 5:
		days = 7
	case masteryLevel >= 2:
		days = 3
	}
	return time.Duration(days) * 24 * time.Hour
}

func (s *SRSService) easyInterval(masteryLevel int, _ float64) time.Duration {
	days := 3
	switch {
	case masteryLevel >= 8:
		days = 30
	case masteryLevel >= 5:
		days = 14
	case masteryLevel >= 2:
		days = 7
	}
	return time.Duration(days) * 24 * time.Hour
}

func (s *SRSService) CalculateEaseFactor(rating model.ReviewGrade, currentEase float64) float64 {
	const (
		minEase = 1.30
		maxEase = 3.00
	)

	var delta float64
	switch rating {
	case model.GradeAgain:
		delta = -0.20
	case model.GradeHard:
		delta = -0.05
	case model.GradeGood:
		delta = 0.05
	case model.GradeEasy:
		delta = 0.15
	}

	newEase := currentEase + delta
	return math.Max(minEase, math.Min(maxEase, newEase))
}

func (s *SRSService) CalculateMastery(isCorrect bool, currentLevel int) int {
	if isCorrect && currentLevel < 10 {
		return currentLevel + 1
	}
	if !isCorrect && currentLevel > 0 {
		return currentLevel - 1
	}
	return currentLevel
}

func (s *SRSService) GetMemoryStatus(isCorrect bool, masteryLevel int) string {
	if !isCorrect {
		return "Lapsed"
	}
	switch {
	case masteryLevel >= 7:
		return "Mastered"
	case masteryLevel >= 2:
		return "Reviewing"
	default:
		return "Learning"
	}
}

func (s *SRSService) PriorityScore(nextReviewDate *time.Time, consecutiveWrong int, masteryLevel int) float64 {
	if nextReviewDate == nil {
		return 0
	}

	overdueHours := time.Since(*nextReviewDate).Hours()
	if overdueHours < 0 {
		return overdueHours
	}

	multiplier := 1.0
	if consecutiveWrong > 0 {
		multiplier = 3.0
	}

	return overdueHours * multiplier * (10.0 - float64(masteryLevel))
}
