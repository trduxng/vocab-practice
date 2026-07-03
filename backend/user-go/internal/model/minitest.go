package model

type MiniTest struct {
	ID             int64   `json:"id" db:"id"`
	Title          string  `json:"title" db:"title"`
	Description    *string `json:"description" db:"description"`
	TopicName      *string `json:"topicName" db:"topicName"`
	TopicCode      *string `json:"topicCode" db:"topicCode"`
	TotalQuestions int     `json:"totalQuestions" db:"totalQuestions"`
}

type MiniTestQuestion struct {
	QuestionID    int64   `json:"questionId" db:"questionId"`
	QuestionType  string  `json:"questionType" db:"questionType"`
	QuestionText  string  `json:"questionText" db:"questionText"`
	OptionsJson   *string `json:"optionsJson" db:"optionsJson"`
	CorrectAnswer string  `json:"correctAnswer" db:"correctAnswer"`
	Term          string  `json:"term" db:"term"`
	Meaning       string  `json:"meaning" db:"meaning"`
}

type MiniTestAnswer struct {
	QuestionID      *int64  `json:"questionId"`
	WordID          *int64  `json:"wordId"`
	SubmittedAnswer string  `json:"submittedAnswer"`
}

type MiniTestResult struct {
	Total     int                 `json:"total"`
	Correct   int                 `json:"correct"`
	Score     int                 `json:"score"`
	XPEarned  int64               `json:"xpEarned"`
	Results   []MiniTestItemResult `json:"results"`
}

type MiniTestItemResult struct {
	QuestionID *int64 `json:"questionId"`
	WordID     *int64 `json:"wordId"`
	IsCorrect  bool   `json:"isCorrect"`
}

type TestHistoryItem struct {
	Date           string `json:"date" db:"date"`
	TestID         int64  `json:"testId" db:"testId"`
	TestTitle      string `json:"testTitle" db:"testTitle"`
	TotalQuestions int    `json:"totalQuestions" db:"totalQuestions"`
	CorrectAnswers int    `json:"correctAnswers" db:"correctAnswers"`
}

type TestSessionDetail struct {
	QuestionText    string  `json:"questionText" db:"questionText"`
	QuestionType    string  `json:"questionType" db:"questionType"`
	OptionsJson     *string `json:"optionsJson" db:"optionsJson"`
	CorrectAnswer   string  `json:"correctAnswer" db:"correctAnswer"`
	SubmittedAnswer *string `json:"submittedAnswer" db:"submittedAnswer"`
	IsCorrect       bool    `json:"isCorrect" db:"isCorrect"`
	Term            string  `json:"term" db:"term"`
	Meaning         string  `json:"meaning" db:"meaning"`
}
