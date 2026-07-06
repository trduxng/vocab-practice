package srs

import (
	"testing"
	"time"
)

func TestCalculateEaseFactor(t *testing.T) {
	tests := []struct {
		name     string
		current  float64
		rating   Rating
		expected float64
	}{
		{"again reduces by 0.20", 2.50, RatingAgain, 2.30},
		{"hard reduces by 0.05", 2.50, RatingHard, 2.45},
		{"good increases by 0.05", 2.50, RatingGood, 2.55},
		{"easy increases by 0.15", 2.50, RatingEasy, 2.65},
		{"clamp min", 1.35, RatingAgain, 1.30},
		{"clamp max", 2.90, RatingEasy, 3.00},
		{"zero current uses default", 0, RatingGood, 2.55},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalculateEaseFactor(tt.current, tt.rating)
			if got != tt.expected {
				t.Errorf("got %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestCalculateMasteryLevel(t *testing.T) {
	tests := []struct {
		name       string
		current    int
		isCorrect  bool
		expected   int
	}{
		{"correct increments", 5, true, 6},
		{"incorrect decrements", 5, false, 4},
		{"max stays at 10", 10, true, 10},
		{"min stays at 0", 0, false, 0},
		{"negative clamped", -1, true, 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalculateMasteryLevel(tt.current, tt.isCorrect)
			if got != tt.expected {
				t.Errorf("got %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestDetermineMemoryStatus(t *testing.T) {
	tests := []struct {
		name         string
		isCorrect    bool
		masteryLevel int
		expected     MemoryStatus
	}{
		{"incorrect → Lapsed", false, 5, MemoryStatusLapsed},
		{"correct + level 0 → Learning", true, 0, MemoryStatusLearning},
		{"correct + level 1 → Learning", true, 1, MemoryStatusLearning},
		{"correct + level 2 → Reviewing", true, 2, MemoryStatusReviewing},
		{"correct + level 6 → Reviewing", true, 6, MemoryStatusReviewing},
		{"correct + level 7 → Mastered", true, 7, MemoryStatusMastered},
		{"correct + level 10 → Mastered", true, 10, MemoryStatusMastered},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := DetermineMemoryStatus(tt.isCorrect, tt.masteryLevel)
			if got != tt.expected {
				t.Errorf("got %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestCalculateNextReview(t *testing.T) {
	now := time.Date(2026, 7, 6, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name         string
		rating       Rating
		masteryLevel int
		expected     time.Time
	}{
		{"Again → +10min", RatingAgain, 5, now.Add(10 * time.Minute)},
		{"Hard → +1 day", RatingHard, 5, now.Add(24 * time.Hour)},
		{"Good + low mastery → +1 day", RatingGood, 0, now.Add(24 * time.Hour)},
		{"Good + mid mastery → +3 days", RatingGood, 3, now.Add(72 * time.Hour)},
		{"Good + high mastery → +7 days", RatingGood, 6, now.Add(7 * 24 * time.Hour)},
		{"Good + max mastery → +14 days", RatingGood, 9, now.Add(14 * 24 * time.Hour)},
		{"Easy + low mastery → +3 days", RatingEasy, 0, now.Add(3 * 24 * time.Hour)},
		{"Easy + mid mastery → +7 days", RatingEasy, 3, now.Add(7 * 24 * time.Hour)},
		{"Easy + high mastery → +14 days", RatingEasy, 6, now.Add(14 * 24 * time.Hour)},
		{"Easy + max mastery → +30 days", RatingEasy, 9, now.Add(30 * 24 * time.Hour)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalculateNextReview(tt.rating, tt.masteryLevel, now)
			if !got.Equal(tt.expected) {
				t.Errorf("got %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestGrade(t *testing.T) {
	result := Grade(GradeInput{
		CurrentEF:    2.50,
		Rating:       "Good",
		MasteryLevel: 4,
		IsCorrect:    true,
	})
	if result.NewEF != 2.55 {
		t.Errorf("NewEF: got %v, want 2.55", result.NewEF)
	}
	if result.NewMastery != 5 {
		t.Errorf("NewMastery: got %v, want 5", result.NewMastery)
	}
	if result.MemoryStatus != MemoryStatusReviewing {
		t.Errorf("MemoryStatus: got %v, want Reviewing", result.MemoryStatus)
	}
	if result.NextReview == "" {
		t.Errorf("NextReview should not be empty")
	}
}
