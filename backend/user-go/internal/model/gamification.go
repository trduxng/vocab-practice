package model

import "time"

type Achievement struct {
	ID            int64   `json:"id" db:"id"`
	Code          string  `json:"code" db:"code"`
	Label         string  `json:"label" db:"label"`
	Description   string  `json:"description" db:"description"`
	Icon          string  `json:"icon" db:"icon"`
	Unlocked      bool    `json:"unlocked" db:"unlocked"`
	UnlockedAt    *string `json:"unlockedAt" db:"unlockedAt"`
	Seen          bool    `json:"seen" db:"seen"`
	ProgressPct   int     `json:"progressPercentage"`
}

type GamificationProfile struct {
	TotalXP        int64         `json:"totalXP"`
	TodayXP        int64         `json:"todayXP"`
	CurrentLevel   int           `json:"currentLevel"`
	CurrentLevelXP int64         `json:"currentLevelXP"`
	XpForNextLevel int64         `json:"xpForNextLevel"`
	XpToNextLevel  int64         `json:"xpToNextLevel"`
	LevelProgress  float64       `json:"levelProgress"`
	WordsLearned   int           `json:"wordsLearned"`
	Streak         int           `json:"streak"`
	BestTestScore  *float64      `json:"bestTestScore"`
	Achievements   []Achievement `json:"achievements"`
	UnseenAchievements []Achievement `json:"unseenAchievements"`
}

type GamificationReward struct {
	XpEventID      int64         `json:"xpEventId"`
	XpGained       int64         `json:"xpGained"`
	EventType      string        `json:"eventType"`
	Awarded        bool          `json:"awarded"`
	TotalXP        int64         `json:"totalXP"`
	CurrentLevel   int           `json:"currentLevel"`
	CurrentLevelXP int64         `json:"currentLevelXP"`
	XpForNextLevel int64         `json:"xpForNextLevel"`
	LevelProgress  float64       `json:"levelProgress"`
	Achievements   []Achievement `json:"unlockedAchievements"`
}

type XPEvent struct {
	UserID    int64     `json:"userId"`
	EventType string    `json:"eventType"`
	XPAmount  int64     `json:"xpAmount"`
	SourceKey *string   `json:"sourceKey"`
	Metadata  *string   `json:"metadata"`
	CreatedAt time.Time `json:"createdAt"`
}

type SessionSummary struct {
	TotalAttempts int          `json:"totalAttempts"`
	CorrectCount  int          `json:"correctCount"`
	WrongCount    int          `json:"wrongCount"`
	Accuracy      float64      `json:"accuracy"`
	XPEarned      int64        `json:"xpEarned"`
	TotalXP       int64        `json:"totalXP"`
	CurrentLevel  int          `json:"currentLevel"`
	WeakWords     []WeakWord   `json:"weakWords"`
}
