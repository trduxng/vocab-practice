package srs

import "math"

func CalculateEaseFactor(currentEF float64, rating Rating) float64 {
	ef := currentEF
	if ef == 0 {
		ef = DefaultEF
	}
	switch rating {
	case RatingAgain:
		ef -= 0.20
	case RatingHard:
		ef -= 0.05
	case RatingGood:
		ef += 0.05
	case RatingEasy:
		ef += 0.15
	}
	return math.Max(MinEF, math.Min(MaxEF, ef))
}
