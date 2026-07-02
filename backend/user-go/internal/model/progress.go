package model

import "time"

type ActivityDay struct {
	Date          string `json:"date" db:"date"`
	ActivityCount int    `json:"activityCount" db:"activityCount"`
	XPEarned      int64  `json:"xpEarned" db:"xpEarned"`
}

type VocabularyGrowthPoint struct {
	Date          string `json:"date" db:"date"`
	LearnedWords  int    `json:"learnedWords" db:"learnedWords"`
	MasteredWords int    `json:"masteredWords" db:"masteredWords"`
}

type TopicMasteryProgress struct {
	TopicID            int64   `json:"topicId" db:"topicId"`
	TopicName          string  `json:"topicName" db:"topicName"`
	TotalWords         int     `json:"totalWords" db:"totalWords"`
	LearnedWords       int     `json:"learnedWords" db:"learnedWords"`
	MasteredWords      int     `json:"masteredWords" db:"masteredWords"`
	AverageMastery     float64 `json:"averageMastery" db:"averageMastery"`
	CompletionPct      int     `json:"completionPercentage"`
}

type RetentionStats struct {
	TotalAnswers      int `json:"totalAnswers" db:"totalAnswers"`
	CorrectAnswers    int `json:"correctAnswers" db:"correctAnswers"`
	LearnedWords      int `json:"learnedWords" db:"learnedWords"`
	ForgottenWords    int `json:"forgottenWords" db:"forgottenWords"`
	UpToDateWords     int `json:"upToDateWords" db:"upToDateWords"`
	MasteredWords     int `json:"masteredWords" db:"masteredWords"`
}

type ProgressAnalytics struct {
	Summary          ProgressSummary         `json:"summary"`
	Activity         []ActivityDay           `json:"activity"`
	VocabularyGrowth []VocabularyGrowthPoint `json:"vocabularyGrowth"`
	TopicMastery     []TopicMasteryProgress   `json:"topicMastery"`
	Retention        RetentionCalculated     `json:"retention"`
}

type ProgressSummary struct {
	ActiveDays    int   `json:"activeDays"`
	TotalXP       int64 `json:"totalXP"`
	CurrentStreak int   `json:"currentStreak"`
	LearnedWords  int   `json:"learnedWords"`
	MasteredWords int   `json:"masteredWords"`
}

type RetentionCalculated struct {
	CorrectAnswerRate    int `json:"correctAnswerRate"`
	ForgottenWordRate    int `json:"forgottenWordRate"`
	ReviewCompletionRate int `json:"reviewCompletionRate"`
	TotalAnswers         int `json:"totalAnswers"`
	CorrectAnswers       int `json:"correctAnswers"`
	LearnedWords         int `json:"learnedWords"`
	ForgottenWords       int `json:"forgottenWords"`
	UpToDateWords        int `json:"upToDateWords"`
}

type MasteryTimeline struct {
	TotalWords            int        `json:"totalWords"`
	MasteredWords         int        `json:"masteredWords"`
	CompletionPct         float64    `json:"completionPercentage"`
	EstimatedDays         *int       `json:"estimatedDaysToMastery"`
	ProjectedDate         *time.Time `json:"projectedCompletionDate"`
}

type DashboardStats struct {
	TotalLearned    int                    `json:"totalLearned"`
	Accuracy        int                    `json:"accuracy"`
	Correct         int                    `json:"correct"`
	Wrong           int                    `json:"wrong"`
	Streak          int                    `json:"streak"`
	TotalXP         int64                  `json:"totalXP"`
	CurrentLevel    int                    `json:"currentLevel"`
	LevelProgress   float64                `json:"levelProgress"`
	TodayXP         int64                  `json:"todayXP"`
	WeakWords       []WeakWord             `json:"weakWords"`
	RecentAttempts  []RecentAttempt        `json:"recentAttempts"`
	DailyTrends     []DailyTrend           `json:"dailyTrends"`
	MasteryTimeline *MasteryTimeline       `json:"masteryTimeline"`
	Achievements    []Achievement          `json:"achievements"`
}

type WeakWord struct {
	Word    string `json:"word" db:"word"`
	Meaning string `json:"meaning" db:"meaning"`
}

type RecentAttempt struct {
	Answer    string    `json:"answer" db:"answer"`
	IsCorrect bool      `json:"isCorrect" db:"isCorrect"`
	Date      time.Time `json:"date" db:"date"`
	Term      string    `json:"term" db:"term"`
}

type DailyTrend struct {
	Day   string `json:"day" db:"date"`
	Count int    `json:"count" db:"count"`
}

func CalculatePercentage(value, total int) int {
	if total == 0 {
		return 0
	}
	return int(float64(value) * 100.0 / float64(total))
}
