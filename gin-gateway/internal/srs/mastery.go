package srs

func CalculateMasteryLevel(currentLevel int, isCorrect bool) int {
	cl := currentLevel
	if cl < 0 {
		cl = 0
	}
	if isCorrect && cl < MaxMastery {
		return cl + 1
	}
	if !isCorrect && cl > 0 {
		return cl - 1
	}
	return cl
}

func DetermineMemoryStatus(isCorrect bool, masteryLevel int) MemoryStatus {
	if !isCorrect {
		return MemoryStatusLapsed
	}
	if masteryLevel >= 7 {
		return MemoryStatusMastered
	}
	if masteryLevel >= 2 {
		return MemoryStatusReviewing
	}
	return MemoryStatusLearning
}
