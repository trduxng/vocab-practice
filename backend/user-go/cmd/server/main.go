package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/vocab-practice/user-go/internal/config"
	"github.com/vocab-practice/user-go/internal/handler"
	"github.com/vocab-practice/user-go/internal/middleware"
	"github.com/vocab-practice/user-go/internal/repository"
	"github.com/vocab-practice/user-go/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Database connection
	db, err := repository.NewDB(&cfg.Database)
	if err != nil {
		log.Printf("WARNING: Database connection failed: %v", err)
		log.Println("Server will start but DB-dependent routes will fail")
	} else {
		defer db.Close()
		log.Println("Connected to database")
	}

	// Repositories
	var (
		userRepo         *repository.UserRepo
		flashcardRepo    *repository.FlashcardRepo
		progressRepo     *repository.ProgressRepo
		gamificationRepo *repository.GamificationRepo
		notebookRepo     *repository.NotebookRepo
		notificationRepo *repository.NotificationRepo
		minitestRepo     *repository.MiniTestRepo
	)

	if db != nil {
		userRepo = repository.NewUserRepo(db)
		flashcardRepo = repository.NewFlashcardRepo(db)
		progressRepo = repository.NewProgressRepo(db)
		gamificationRepo = repository.NewGamificationRepo(db)
		notebookRepo = repository.NewNotebookRepo(db)
		notificationRepo = repository.NewNotificationRepo(db)
		minitestRepo = repository.NewMiniTestRepo(db)
	}

	// Services
	gamificationSvc := service.NewGamificationService(gamificationRepo, userRepo)

	// Handlers
	userHandler := handler.NewUserHandler(userRepo)
	flashcardHandler := handler.NewFlashcardHandler(flashcardRepo)
	progressHandler := handler.NewProgressHandler(progressRepo, gamificationRepo)
	notebookHandler := handler.NewNotebookHandler(notebookRepo)
	notificationHandler := handler.NewNotificationHandler(notificationRepo)
	minitestHandler := handler.NewMiniTestHandler(minitestRepo, flashcardRepo, gamificationSvc)
	gamificationHandler := handler.NewGamificationHandler(gamificationSvc)
	practiceHandler := handler.NewPracticeHandler(flashcardRepo, minitestRepo, gamificationRepo, gamificationSvc)

	// Gin router
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	// Public routes
	r.GET("/health", handler.HealthCheck)
	r.GET("/api/health", handler.HealthCheck)

	// User routes (authenticated)
	userGroup := r.Group("/api/user")
	userGroup.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	{
		// Flashcards & Review
		userGroup.GET("/flashcards", flashcardHandler.GetDueFlashcards)
		userGroup.POST("/submit-answer", practiceHandler.SubmitAnswer)
		userGroup.GET("/review/smart-queue", flashcardHandler.GetSmartReviewQueue)
		userGroup.GET("/review/mistakes", flashcardHandler.GetMistakeReviewQueue)
		userGroup.GET("/review/session-summary", progressHandler.GetSessionSummary)

		// Topics
		userGroup.GET("/topics/:topicId/words", flashcardHandler.GetTopicWords)

		// Stats & Progress
		userGroup.GET("/stats", progressHandler.GetStats)
		userGroup.GET("/progress/analytics", progressHandler.GetProgressAnalytics)
		userGroup.GET("/activity/heatmap", progressHandler.GetActivityHeatmap)

		// Daily Goals
		userGroup.GET("/goals/daily-goal", userHandler.GetDailyGoal)
		userGroup.PUT("/goals/daily-goal", userHandler.UpdateDailyGoal)
		userGroup.PUT("/goals/srs-config", userHandler.UpdateSRSConfig)
		userGroup.GET("/goals/daily-progress", flashcardHandler.GetDailyProgress)

		// Profile & Settings
		userGroup.PUT("/profile", userHandler.UpdateProfile)

		// Mini Tests
		userGroup.GET("/minitests", minitestHandler.GetMiniTests)
		userGroup.GET("/minitests/history", minitestHandler.GetTestHistory)
		userGroup.GET("/minitests/session-details", minitestHandler.GetSessionDetails)
		userGroup.GET("/minitests/:id", minitestHandler.GetMiniTestDetails)
		userGroup.POST("/minitests/:id/submit", minitestHandler.SubmitMiniTest)

		// Gamification
		userGroup.GET("/gamification/profile", gamificationHandler.GetProfile)
		userGroup.POST("/gamification/practice-complete", gamificationHandler.CompletePractice)
		userGroup.PUT("/gamification/achievements/seen", gamificationHandler.MarkAchievementsSeen)

		// Notifications
		userGroup.GET("/notifications", notificationHandler.GetNotifications)
		userGroup.PUT("/notifications/:id/read", notificationHandler.MarkRead)
		userGroup.PUT("/notifications/read-all", notificationHandler.MarkAllRead)

		// Notebook
		userGroup.GET("/notebook", notebookHandler.GetNotebook)
		userGroup.GET("/notebook/check", notebookHandler.CheckEntry)
		userGroup.POST("/notebook", notebookHandler.AddEntry)
		userGroup.PUT("/notebook/:id", notebookHandler.UpdateEntry)
		userGroup.DELETE("/notebook/:id", notebookHandler.DeleteEntry)
	}

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Go user service starting on %s", addr)

	server := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	log.Println("Go user service is ready!")

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down user Go service...")
	if db != nil {
		db.Close()
	}
}
