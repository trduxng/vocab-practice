package srs

import "time"

func getIntervalDays(masteryLevel int, isEasy bool) int {
	if masteryLevel >= 8 {
		if isEasy {
			return 30
		}
		return 14
	}
	if masteryLevel >= 5 {
		if isEasy {
			return 14
		}
		return 7
	}
	if masteryLevel >= 2 {
		if isEasy {
			return 7
		}
		return 3
	}
	if isEasy {
		return 3
	}
	return 1
}

func CalculateNextReview(rating Rating, masteryLevel int, now time.Time) time.Time {
	switch rating {
	case RatingAgain:
		return now.Add(10 * time.Minute)
	case RatingHard:
		return now.Add(24 * time.Hour)
	case RatingEasy:
		return now.Add(time.Duration(getIntervalDays(masteryLevel, true)) * 24 * time.Hour)
	case RatingGood:
		return now.Add(time.Duration(getIntervalDays(masteryLevel, false)) * 24 * time.Hour)
	}
	return now.Add(time.Duration(getIntervalDays(masteryLevel, false)) * 24 * time.Hour)
}
