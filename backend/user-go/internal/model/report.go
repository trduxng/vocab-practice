package model

type CreateReportRequest struct {
	ReportType  string `json:"reportType"`
	EntityType  string `json:"entityType"`
	WordID      *int64 `json:"wordId"`
	QuestionID  *int64 `json:"questionId"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type CreateReportResponse struct {
	ID int64 `json:"id"`
}
