package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/vocab-practice/user-go/internal/model"
	"github.com/vocab-practice/user-go/internal/repository"
)

type UserHandler struct {
	userRepo   *repository.UserRepo
	reportRepo *repository.ReportRepo
}

func NewUserHandler(userRepo *repository.UserRepo, reportRepo *repository.ReportRepo) *UserHandler {
	return &UserHandler{userRepo: userRepo, reportRepo: reportRepo}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := c.GetInt64("userId")
	user, err := h.userRepo.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		return
	}
	c.JSON(http.StatusOK, model.UserProfile{
		ID:        user.ID,
		FullName:  user.FullName,
		Email:     user.Email,
		DailyGoal: user.DailyGoal,
		SRSLimit:  user.SRSLimit,
	})
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetInt64("userId")
	var req model.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	if req.Email != "" {
		exists, err := h.userRepo.CheckEmailExists(c.Request.Context(), req.Email, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
			return
		}
		if exists {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Email already in use"})
			return
		}
	}

	if err := h.userRepo.UpdateProfile(c.Request.Context(), userID, req.FullName, req.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update profile"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Profile updated", "data": req})
}

func (h *UserHandler) GetDailyGoal(c *gin.Context) {
	userID := c.GetInt64("userId")
	setting, err := h.userRepo.GetDailyGoal(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to load settings"})
		return
	}
	c.JSON(http.StatusOK, setting)
}

func (h *UserHandler) UpdateDailyGoal(c *gin.Context) {
	userID := c.GetInt64("userId")
	var req struct {
		DailyGoal int `json:"dailyGoal"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.DailyGoal < 5 || req.DailyGoal > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Goal must be between 5 and 100"})
		return
	}

	if err := h.userRepo.UpdateDailyGoal(c.Request.Context(), userID, req.DailyGoal); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update goal"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"dailyGoal": req.DailyGoal})
}

func (h *UserHandler) UpdateSRSConfig(c *gin.Context) {
	userID := c.GetInt64("userId")
	var req struct {
		SRSReviewLimit int `json:"srsReviewLimit"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.SRSReviewLimit < 5 || req.SRSReviewLimit > 50 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Limit must be between 5 and 50"})
		return
	}

	if err := h.userRepo.UpdateSRSLimit(c.Request.Context(), userID, req.SRSReviewLimit); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update SRS config"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"srsReviewLimit": req.SRSReviewLimit})
}

func (h *UserHandler) CreateReport(c *gin.Context) {
	userID := c.GetInt64("userId")

	var req model.CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Dữ liệu không hợp lệ"})
		return
	}

	// Ensure schema exists
	if err := h.reportRepo.EnsureSchema(c.Request.Context()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Lỗi cơ sở dữ liệu"})
		return
	}

	result, err := h.reportRepo.CreateReport(c.Request.Context(), userID, req)
	if err != nil {
		switch err.Error() {
		case "Invalid report type":
			c.JSON(http.StatusBadRequest, gin.H{"message": "Loại báo cáo không hợp lệ"})
		case "Invalid entity type":
			c.JSON(http.StatusBadRequest, gin.H{"message": "Loại thực thể không hợp lệ"})
		case "Report description is too short":
			c.JSON(http.StatusBadRequest, gin.H{"message": "Mô tả báo cáo quá ngắn"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Lỗi khi tạo báo cáo"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Đã gửi báo cáo", "data": result})
}
