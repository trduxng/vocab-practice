package ai

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) SuggestWordContent(c *gin.Context) {
	var req SuggestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	if req.ExampleCount <= 0 {
		req.ExampleCount = 3
	}

	result, err := h.service.Suggest(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
