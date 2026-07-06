package srs

const (
	MinEF          = 1.30
	MaxEF          = 3.00
	DefaultEF      = 2.50
	MaxMastery     = 10
)

type Rating string

const (
	RatingAgain Rating = "Again"
	RatingHard  Rating = "Hard"
	RatingGood  Rating = "Good"
	RatingEasy  Rating = "Easy"
)

type MemoryStatus string

const (
	MemoryStatusLapsed    MemoryStatus = "Lapsed"
	MemoryStatusLearning  MemoryStatus = "Learning"
	MemoryStatusReviewing MemoryStatus = "Reviewing"
	MemoryStatusMastered  MemoryStatus = "Mastered"
)

type GradeResult struct {
	NewEF        float64      `json:"newEF"`
	NewMastery   int          `json:"newMastery"`
	NextReview   string       `json:"nextReview"`
	MemoryStatus MemoryStatus `json:"memoryStatus"`
}
