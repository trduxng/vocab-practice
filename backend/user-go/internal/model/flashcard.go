package model

import "time"

type Flashcard struct {
	QuestionID      *int64  `json:"questionId" db:"questionId"`
	QuestionType    *string `json:"questionType" db:"questionType"`
	QuestionText    *string `json:"questionText" db:"questionText"`
	CorrectAnswer   *string `json:"correctAnswer" db:"correctAnswer"`
	OptionsJson     *string `json:"optionsJson" db:"optionsJson"`
	Phonetic        *string `json:"phonetic" db:"phonetic"`
	Meaning         string  `json:"meaning" db:"meaning"`
	Term            string  `json:"term" db:"term"`
	AudioUrlUK      *string `json:"audioUrlUK" db:"audioUrlUK"`
	AudioUrlUS      *string `json:"audioUrlUS" db:"audioUrlUS"`
	WordID          int64   `json:"wordId" db:"wordId"`
	PartOfSpeech    *string `json:"partOfSpeechName" db:"partOfSpeechName"`
	MasteryLevel    int     `json:"masteryLevel" db:"masteryLevel"`
	MemoryStatus    string  `json:"memoryStatus" db:"memoryStatus"`
	RepetitionCount int     `json:"repetitionCount" db:"repetitionCount"`
	ExampleSentence *string `json:"exampleSentence" db:"exampleSentence"`
	ExampleMeaning  *string `json:"exampleMeaning" db:"exampleMeaning"`
}

type FlashcardFilters struct {
	TopicID *int64
	Mode    string // "", "new", "learned"
	Limit   int
}

type ReviewGrade string

const (
	GradeAgain ReviewGrade = "Again"
	GradeHard  ReviewGrade = "Hard"
	GradeGood  ReviewGrade = "Good"
	GradeEasy  ReviewGrade = "Easy"
)

type SubmitAnswerRequest struct {
	QuestionID     *int64      `json:"questionId"`
	WordID         *int64      `json:"wordId"`
	SubmittedAnswer string    `json:"submittedAnswer"`
	IsCorrect      bool        `json:"isCorrect"`
	ReviewRating   *ReviewGrade `json:"reviewRating"`
	ActivityType   string      `json:"activityType"`
}

type SubmitAnswerResponse struct {
	XPGained     int64      `json:"xpGained"`
	NextReview   *time.Time `json:"nextReviewDate"`
	MasteryLevel int        `json:"masteryLevel"`
	MemoryStatus string     `json:"memoryStatus"`
	ReviewRating *ReviewGrade `json:"reviewRating"`
}

type SmartReviewItem struct {
	WordID           int64      `json:"wordId" db:"wordId"`
	Term             string     `json:"term" db:"term"`
	Phonetic         *string    `json:"phonetic" db:"phonetic"`
	Meaning          string     `json:"meaning" db:"meaning"`
	MasteryLevel     int        `json:"masteryLevel" db:"masteryLevel"`
	MemoryStatus     string     `json:"memoryStatus" db:"memoryStatus"`
	LastReviewedAt   *time.Time `json:"lastReviewedAt" db:"lastReviewedAt"`
	NextReviewDate   *time.Time `json:"nextReviewDate" db:"nextReviewDate"`
	RepetitionCount  int        `json:"repetitionCount" db:"repetitionCount"`
	ConsecutiveWrong int        `json:"consecutiveWrong" db:"consecutiveWrong"`
	PriorityScore    float64    `json:"priorityScore" db:"priorityScore"`
}

type MistakeReviewItem struct {
	WordID           int64   `json:"wordId" db:"wordId"`
	Term             string  `json:"term" db:"term"`
	Meaning          string  `json:"meaning" db:"meaning"`
	MasteryLevel     int     `json:"masteryLevel" db:"masteryLevel"`
	MemoryStatus     string  `json:"memoryStatus" db:"memoryStatus"`
	ConsecutiveWrong int     `json:"consecutiveWrong" db:"consecutiveWrong"`
	WrongCount       int     `json:"wrongCount" db:"wrongCount"`
}

type TopicWord struct {
	WordID          int64      `json:"wordId" db:"wordId"`
	Term            string     `json:"term" db:"term"`
	Meaning         string     `json:"meaning" db:"meaning"`
	Phonetic        *string    `json:"phonetic" db:"phonetic"`
	PartOfSpeech    *string    `json:"partOfSpeechName" db:"partOfSpeechName"`
	MasteryLevel    int        `json:"masteryLevel" db:"masteryLevel"`
	MemoryStatus    string     `json:"memoryStatus" db:"memoryStatus"`
	RepetitionCount int        `json:"repetitionCount" db:"repetitionCount"`
	LastReviewedAt  *time.Time `json:"lastReviewedAt" db:"lastReviewedAt"`
	NextReviewDate  *time.Time `json:"nextReviewDate" db:"nextReviewDate"`
	NotebookID      *int64     `json:"notebookId" db:"notebookId"`
	IsInNotebook    bool       `json:"isInNotebook" db:"isInNotebook"`
	ExampleSentence *string    `json:"exampleSentence" db:"exampleSentence"`
	ExampleMeaning  *string    `json:"exampleMeaning" db:"exampleMeaning"`
}
