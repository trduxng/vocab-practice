package main

import (
	"math"
)

// GetLevelState calculates level, XP progress in O(1).
// Formula: level = floor((1 + sqrt(1 + 8 * totalXP / 100)) / 2)
// Total XP needed for level n: 50 * n * (n-1)
func GetLevelState(totalXP int) LevelState {
	safeXP := math.Max(0, float64(totalXP))
	currentLevel := int(math.Floor((1 + math.Sqrt(1+8*safeXP/100)) / 2))
	if currentLevel < 1 {
		currentLevel = 1
	}
	xpForNextLevel := currentLevel * 100
	levelStartXP := 50 * (currentLevel - 1) * currentLevel
	currentLevelXP := int(safeXP) - levelStartXP

	return LevelState{
		TotalXP:          int(safeXP),
		CurrentLevel:     currentLevel,
		CurrentLevelXP:   currentLevelXP,
		XPForNextLevel:   xpForNextLevel,
		XPToNextLevel:    xpForNextLevel - currentLevelXP,
		NextLevelTotalXP: levelStartXP + xpForNextLevel,
		LevelProgress:    percent(currentLevelXP, xpForNextLevel),
	}
}

// GetAchievementProgress resolves current progress for a criteria type.
func GetAchievementProgress(criteriaType string, m *Metrics) int {
	switch criteriaType {
	case "WORDS_LEARNED":
		return m.WordsLearned
	case "STREAK_DAYS":
		return m.Streak
	case "TEST_SCORE":
		return m.BestTestScore
	case "LEVEL":
		return m.CurrentLevel
	default:
		return 0
	}
}

func percent(value, total int) int {
	if total <= 0 {
		return 0
	}
	p := int(math.Round(float64(value) * 100.0 / float64(total)))
	if p > 100 {
		return 100
	}
	if p < 0 {
		return 0
	}
	return p
}
