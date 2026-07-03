package repository

import (
	"context"
	"fmt"

	"github.com/vocab-practice/user-go/internal/model"
)

type ReportRepo struct {
	db *DB
}

func NewReportRepo(db *DB) *ReportRepo {
	return &ReportRepo{db: db}
}

func (r *ReportRepo) EnsureSchema(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `
		IF OBJECT_ID(N'dbo.ContentReports', N'U') IS NULL
		BEGIN
			CREATE TABLE dbo.ContentReports
			(
				ContentReportID BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ContentReports PRIMARY KEY,
				ReporterUserID BIGINT NOT NULL,
				EntityType NVARCHAR(30) NOT NULL,
				WordID BIGINT NULL,
				QuestionID BIGINT NULL,
				ReportType NVARCHAR(50) NOT NULL,
				Title NVARCHAR(200) NOT NULL,
				Description NVARCHAR(2000) NOT NULL,
				Status NVARCHAR(30) NOT NULL CONSTRAINT DF_ContentReports_Status DEFAULT (N'Open'),
				Priority NVARCHAR(20) NOT NULL CONSTRAINT DF_ContentReports_Priority DEFAULT (N'Normal'),
				AdminResponse NVARCHAR(2000) NULL,
				ResolvedByUserID BIGINT NULL,
				ResolvedAt DATETIMEOFFSET(7) NULL,
				CreatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ContentReports_CreatedAt DEFAULT (SYSDATETIMEOFFSET()),
				UpdatedAt DATETIMEOFFSET(7) NOT NULL CONSTRAINT DF_ContentReports_UpdatedAt DEFAULT (SYSDATETIMEOFFSET()),
				CONSTRAINT FK_ContentReports_ReporterUserID FOREIGN KEY (ReporterUserID) REFERENCES dbo.Users(UserID),
				CONSTRAINT FK_ContentReports_WordID FOREIGN KEY (WordID) REFERENCES dbo.Words(WordID),
				CONSTRAINT FK_ContentReports_QuestionID FOREIGN KEY (QuestionID) REFERENCES dbo.Questions(QuestionID),
				CONSTRAINT FK_ContentReports_ResolvedByUserID FOREIGN KEY (ResolvedByUserID) REFERENCES dbo.Users(UserID),
				CONSTRAINT CK_ContentReports_EntityType CHECK (EntityType IN (N'Word', N'Question', N'Audio', N'General')),
				CONSTRAINT CK_ContentReports_ReportType CHECK (ReportType IN (N'WordIncorrect', N'AudioIssue', N'AnswerIncorrect', N'Typo', N'Other')),
				CONSTRAINT CK_ContentReports_Status CHECK (Status IN (N'Open', N'InReview', N'Resolved', N'Rejected')),
				CONSTRAINT CK_ContentReports_Priority CHECK (Priority IN (N'Low', N'Normal', N'High', N'Urgent'))
			);
		END

		IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentReports_Status_CreatedAt' AND object_id = OBJECT_ID(N'dbo.ContentReports'))
			CREATE INDEX IX_ContentReports_Status_CreatedAt ON dbo.ContentReports(Status, CreatedAt DESC);

		IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentReports_ReportType' AND object_id = OBJECT_ID(N'dbo.ContentReports'))
			CREATE INDEX IX_ContentReports_ReportType ON dbo.ContentReports(ReportType);

		IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_ContentReports_ReporterUserID' AND object_id = OBJECT_ID(N'dbo.ContentReports'))
			CREATE INDEX IX_ContentReports_ReporterUserID ON dbo.ContentReports(ReporterUserID, CreatedAt DESC);
	`)
	return err
}

var validReportTypes = map[string]bool{
	"WordIncorrect":    true,
	"AudioIssue":       true,
	"AnswerIncorrect":  true,
	"Typo":             true,
	"Other":            true,
}

var validEntityTypes = map[string]bool{
	"Word":     true,
	"Question": true,
	"Audio":    true,
	"General":  true,
}

func inferEntityType(reportType string, wordID, questionID *int64, entityType string) string {
	if entityType != "" {
		return entityType
	}
	if reportType == "AudioIssue" {
		return "Audio"
	}
	if questionID != nil && *questionID > 0 {
		return "Question"
	}
	if wordID != nil && *wordID > 0 {
		return "Word"
	}
	return "General"
}

func (r *ReportRepo) CreateReport(ctx context.Context, userID int64, req model.CreateReportRequest) (*model.CreateReportResponse, error) {
	// Validate & infer entity type
	entityType := inferEntityType(req.ReportType, req.WordID, req.QuestionID, req.EntityType)

	if !validReportTypes[req.ReportType] {
		return nil, fmt.Errorf("Invalid report type")
	}
	if !validEntityTypes[entityType] {
		return nil, fmt.Errorf("Invalid entity type")
	}
	if len(req.Description) < 5 {
		return nil, fmt.Errorf("Report description is too short")
	}

	title := req.Title
	if title == "" {
		title = "Report content"
	}
	if len(title) > 200 {
		title = title[:200]
	}
	if len(req.Description) > 2000 {
		req.Description = req.Description[:2000]
	}

	var id int64
	err := r.db.QueryRowContext(ctx,
		`INSERT INTO ContentReports (ReporterUserID, EntityType, WordID, QuestionID, ReportType, Title, Description)
		 OUTPUT INSERTED.ContentReportID
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		userID, entityType, req.WordID, req.QuestionID, req.ReportType, title, req.Description,
	).Scan(&id)
	if err != nil {
		return nil, fmt.Errorf("create report: %w", err)
	}

	return &model.CreateReportResponse{ID: id}, nil
}
