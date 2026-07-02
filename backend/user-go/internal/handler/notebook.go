package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/vocab-practice/user-go/internal/repository"
)

type NotebookHandler struct {
	notebookRepo *repository.NotebookRepo
}

func NewNotebookHandler(notebookRepo *repository.NotebookRepo) *NotebookHandler {
	return &NotebookHandler{notebookRepo: notebookRepo}
}

func (h *NotebookHandler) GetNotebook(c *gin.Context) {
	userID := c.GetInt64("userId")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))

	result, err := h.notebookRepo.GetNotebook(c.Request.Context(), userID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load notebook"})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *NotebookHandler) AddEntry(c *gin.Context) {
	userID := c.GetInt64("userId")
	var req struct {
		WordID       int64   `json:"wordId"`
		PersonalNote *string `json:"personalNote"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.WordID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing wordId"})
		return
	}

	entry, err := h.notebookRepo.AddEntry(c.Request.Context(), userID, req.WordID, req.PersonalNote)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to add entry"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Added to notebook", "data": entry})
}

func (h *NotebookHandler) UpdateEntry(c *gin.Context) {
	userID := c.GetInt64("userId")
	notebookID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid notebook ID"})
		return
	}

	var req struct {
		PersonalNote *string `json:"personalNote"`
		IsFavorite   *bool   `json:"isFavorite"`
	}
	c.ShouldBindJSON(&req)

	entry, err := h.notebookRepo.UpdateEntry(c.Request.Context(), notebookID, userID, req.PersonalNote, req.IsFavorite)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update entry"})
		return
	}
	if entry == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Entry not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Notebook updated", "data": entry})
}

func (h *NotebookHandler) DeleteEntry(c *gin.Context) {
	userID := c.GetInt64("userId")
	notebookID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid notebook ID"})
		return
	}

	deleted, err := h.notebookRepo.DeleteEntry(c.Request.Context(), notebookID, userID)
	if err != nil || deleted == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Entry not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted from notebook"})
}

func (h *NotebookHandler) CheckEntry(c *gin.Context) {
	userID := c.GetInt64("userId")
	wordID, err := strconv.ParseInt(c.Query("wordId"), 10, 64)
	if err != nil || wordID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing wordId"})
		return
	}

	entry, err := h.notebookRepo.CheckEntry(c.Request.Context(), userID, wordID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to check entry"})
		return
	}
	if entry == nil {
		c.JSON(http.StatusOK, gin.H{})
		return
	}
	c.JSON(http.StatusOK, entry)
}
