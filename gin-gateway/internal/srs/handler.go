package srs

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type GradeInput struct {
	CurrentEF    float64 `json:"currentEF"`
	Rating       string  `json:"rating"`
	MasteryLevel int     `json:"masteryLevel"`
	IsCorrect    bool    `json:"isCorrect"`
}

func Grade(input GradeInput) GradeResult {
	rating := Rating(input.Rating)
	now := time.Now()

	newEF := CalculateEaseFactor(input.CurrentEF, rating)
	newMastery := CalculateMasteryLevel(input.MasteryLevel, input.IsCorrect)
	nextReview := CalculateNextReview(rating, input.MasteryLevel, now)
	memStatus := DetermineMemoryStatus(input.IsCorrect, newMastery)

	return GradeResult{
		NewEF:        newEF,
		NewMastery:   newMastery,
		NextReview:   nextReview.Format(time.RFC3339),
		MemoryStatus: memStatus,
	}
}

func GradeHandler(c *gin.Context) {
	var input GradeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body", "error": err.Error()})
		return
	}

	result := Grade(input)
	c.JSON(http.StatusOK, result)
}
