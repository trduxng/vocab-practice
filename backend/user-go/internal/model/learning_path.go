package model

type Roadmap struct {
	CompletionPct      int               `json:"completionPercentage"`
	CompletedTopics    int               `json:"completedTopics"`
	TotalTopics        int               `json:"totalTopics"`
	CurrentPosition    *CurrentPosition  `json:"currentPosition"`
	CurrentLesson      *CurrentLesson    `json:"currentLesson"`
	NextLesson         *CurrentLesson    `json:"nextLesson"`
	Levels             []RoadmapLevel    `json:"levels"`
}

type CurrentPosition struct {
	LevelTitle          string `json:"levelTitle"`
	TopicID             int64  `json:"topicId"`
	TopicTitle          string `json:"topicTitle"`
	TopicStatus         string `json:"topicStatus"`
	ActivityTitle       string `json:"activityTitle"`
	ActivityRoute       string `json:"activityRoute"`
	CompletionPct       int    `json:"completionPercentage"`
}

type CurrentLesson struct {
	TopicID       int64  `json:"topicId"`
	Title         string `json:"title"`
	Route         string `json:"route"`
	Status        string `json:"status"`
	CompletionPct int    `json:"completionPercentage"`
}

type RoadmapLevel struct {
	ID                 int              `json:"id"`
	Code               string           `json:"code"`
	Title              string           `json:"title"`
	TargetScore        int              `json:"targetScore"`
	Description        string           `json:"description"`
	DisplayOrder       int              `json:"displayOrder"`
	AccentKey          string           `json:"accentKey"`
	Status             string           `json:"status"`
	CompletionPct      int              `json:"completionPercentage"`
	CompletedTopics    int              `json:"completedTopics"`
	TotalTopics        int              `json:"totalTopics"`
	Topics             []RoadmapTopic   `json:"topics"`
}

type RoadmapTopic struct {
	PathTopicID       int64               `json:"pathTopicId"`
	TopicID           int64               `json:"topicId"`
	Title             string              `json:"title"`
	Code              string              `json:"code"`
	Description       string              `json:"description"`
	Status            string              `json:"status"`
	CompletionPct     int                 `json:"completionPercentage"`
	TotalWords        int                 `json:"totalWords"`
	LearnedWords      int                 `json:"learnedWords"`
	MasteredWords     int                 `json:"masteredWords"`
	Activities        []TopicActivity     `json:"activities"`
}

type TopicActivity struct {
	Type        string `json:"type"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Route       string `json:"route"`
	Configured  bool   `json:"configured"`
}

// Raw database row types (not exposed in JSON)
type RoadmapLevelRow struct {
	ID           int    `db:"id"`
	Code         string `db:"code"`
	Title        string `db:"title"`
	TargetScore  int    `db:"targetScore"`
	Description  string `db:"description"`
	DisplayOrder int    `db:"displayOrder"`
	AccentKey    string `db:"accentKey"`
}

type RoadmapTopicRow struct {
	PathTopicID        int64  `db:"pathTopicId"`
	LevelID            int    `db:"levelId"`
	DisplayOrder       int    `db:"displayOrder"`
	TopicID            int64  `db:"topicId"`
	Title              string `db:"title"`
	Code               string `db:"code"`
	Description        string `db:"description"`
	TotalWords         int    `db:"totalWords"`
	LearnedWords       int    `db:"learnedWords"`
	MasteredWords      int    `db:"masteredWords"`
	PracticeCompletions int   `db:"practiceCompletions"`
	MiniTestCount       int   `db:"miniTestCount"`
	CompletedMiniTests  int   `db:"completedMiniTests"`
	FirstMiniTestID     *int64 `db:"firstMiniTestId"`
}
