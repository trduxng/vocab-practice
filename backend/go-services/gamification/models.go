package main

import "time"

// LevelState represents XP/level calculation result.
type LevelState struct {
	TotalXP       int   `json:"totalXP"`
	CurrentLevel  int   `json:"currentLevel"`
	CurrentLevelXP int  `json:"currentLevelXP"`
	XPForNextLevel int  `json:"xpForNextLevel"`
	XPToNextLevel  int  `json:"xpToNextLevel"`
	NextLevelTotalXP int `json:"nextLevelTotalXP"`
	LevelProgress  int  `json:"levelProgress"`
}

// Metrics is the aggregated gamification state for a user.
// TotalXP and CurrentLevel are promoted from LevelState (embedded).
type Metrics struct {
	WordsLearned  int `json:"wordsLearned"`
	BestTestScore int `json:"bestTestScore"`
	Streak        int `json:"streak"`
	TodayXP       int `json:"todayXP"`
	LevelState              // promoted: TotalXP, CurrentLevel, CurrentLevelXP, ...
}

// Achievement represents a single achievement row.
type Achievement struct {
	ID                 int        `json:"id"`
	Code               string     `json:"code"`
	Label              string     `json:"label"`
	Description        string     `json:"description"`
	Icon               string     `json:"icon"`
	CriteriaType       string     `json:"criteriaType"`
	Target             int        `json:"target"`
	XPReward           int        `json:"xpReward"`
	Unlocked           bool       `json:"unlocked"`
	UnlockedAt         *time.Time `json:"unlockedAt"`
	Seen               bool       `json:"seen"`
	Progress           int        `json:"progress"`
	ProgressPercentage int        `json:"progressPercentage"`
}

// Profile is the full gamification profile returned to clients.
type Profile struct {
	Metrics
	Achievements      []Achievement `json:"achievements"`
	UnseenAchievements []Achievement `json:"unseenAchievements"`
}

// AwardXPRequest is the JSON body for awarding XP.
type AwardXPRequest struct {
	UserID    int64                  `json:"userId" binding:"required"`
	EventType string                 `json:"eventType" binding:"required"`
	Amount    *int                   `json:"amount,omitempty"`
	XPAmount  *int                   `json:"xpAmount,omitempty"`
	SourceKey *string                `json:"sourceKey,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// AwardXPResponse is returned after awarding XP.
type AwardXPResponse struct {
	XPEventID      int           `json:"xpEventId"`
	XPGained       int           `json:"xpGained"`
	EventType      string        `json:"eventType"`
	Awarded        bool          `json:"awarded"`
	UnlockedAchievements []Achievement `json:"unlockedAchievements"`
	LevelState
}

// MarkSeenRequest is the JSON body for marking achievements seen.
type MarkSeenRequest struct {
	UserID         int64  `json:"userId" binding:"required"`
	AchievementIDs []int  `json:"achievementIds,omitempty"`
}

// XP rewards by event type.
var XP_REWARDS = map[string]int{
	"LearnWord":         5,
	"PracticeComplete":  10,
	"MiniTestComplete":  20,
	"DailyLogin":        5,
	"AchievementUnlock": 50,
}

// Achievement seed data.
type AchievementSeed struct {
	Code          string
	Name          string
	Description   string
	Icon          string
	CriteriaType  string
	CriteriaValue int
	DisplayOrder  int
	XPReward      int
}

var ACHIEVEMENT_SEED = []AchievementSeed{
	{Code: "FIRST_WORD", Name: "First Word", Description: "Learn your first vocabulary word.", Icon: "🌱", CriteriaType: "WORDS_LEARNED", CriteriaValue: 1, DisplayOrder: 1, XPReward: 10},
	{Code: "WORDS_100", Name: "First 100 Words", Description: "Learn 100 vocabulary words.", Icon: "📚", CriteriaType: "WORDS_LEARNED", CriteriaValue: 100, DisplayOrder: 2, XPReward: 100},
	{Code: "STREAK_7", Name: "7 Day Streak", Description: "Learn for 7 consecutive days.", Icon: "🔥", CriteriaType: "STREAK_DAYS", CriteriaValue: 7, DisplayOrder: 3, XPReward: 50},
	{Code: "STREAK_30", Name: "30 Day Streak", Description: "Learn for 30 consecutive days.", Icon: "⚡", CriteriaType: "STREAK_DAYS", CriteriaValue: 30, DisplayOrder: 4, XPReward: 150},
	{Code: "TEST_SCORE_90", Name: "Test Ace", Description: "Score at least 90 percent on a mini test.", Icon: "🎯", CriteriaType: "TEST_SCORE", CriteriaValue: 90, DisplayOrder: 5, XPReward: 50},
	{Code: "LEVEL_5", Name: "Level Five", Description: "Reach learner level 5.", Icon: "🏆", CriteriaType: "LEVEL", CriteriaValue: 5, DisplayOrder: 6, XPReward: 100},
}
