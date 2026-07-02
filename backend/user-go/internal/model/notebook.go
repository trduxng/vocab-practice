package model

import "time"

type NotebookEntry struct {
	NotebookID    int64      `json:"notebookId" db:"NotebookID"`
	UserID        int64      `json:"userId" db:"UserID"`
	WordID        int64      `json:"wordId" db:"WordID"`
	PersonalNote  *string    `json:"personalNote" db:"PersonalNote"`
	IsFavorite    bool      `json:"isFavorite" db:"IsFavorite"`
	AddedAt       time.Time `json:"addedAt" db:"AddedAt"`
	UpdatedAt     time.Time `json:"updatedAt" db:"UpdatedAt"`
	Term          string    `json:"term" db:"term"`
	Meaning       string    `json:"meaning" db:"meaning"`
	Phonetic      *string   `json:"phonetic" db:"phonetic"`
	PartOfSpeech  *string   `json:"partOfSpeechName" db:"partOfSpeechName"`
	MasteryLevel  int       `json:"masteryLevel" db:"masteryLevel"`
}

type PaginatedResponse[T any] struct {
	Data       []T   `json:"data"`
	Total      int   `json:"total"`
	Page       int   `json:"page"`
	PageSize   int   `json:"pageSize"`
	TotalPages int   `json:"totalPages"`
}
