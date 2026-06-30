package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	// Configuration from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "3002"
	}

	dbServer := os.Getenv("DB_SERVER")
	if dbServer == "" {
		dbServer = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "1433"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "sa"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "ToeicVocabularyPlatform"
	}
	encrypt := os.Getenv("DB_ENCRYPT")
	if encrypt == "" {
		encrypt = "false"
	}
	trustCert := os.Getenv("DB_TRUST_SERVER_CERTIFICATE")
	if trustCert == "" {
		trustCert = "true"
	}

	// Build connection string
	connString := fmt.Sprintf(
		"server=%s;port=%s;database=%s;user id=%s;password=%s;encrypt=%s;trustservercertificate=%s",
		dbServer, dbPort, dbName, dbUser, dbPassword, encrypt, trustCert,
	)

	log.Printf("Connecting to SQL Server at %s:%s, database=%s", dbServer, dbPort, dbName)

	// Initialize store
	store, err := NewStore(connString)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer store.Close()
	log.Println("Database connected successfully")

	// Ensure schema
	log.Println("Ensuring database schema...")
	if err := store.EnsureSchema(context.Background()); err != nil {
		log.Fatalf("Failed to ensure schema: %v", err)
	}
	log.Println("Database schema ready")

	// Setup Gin router
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = "release"
	}
	gin.SetMode(ginMode)

	r := gin.Default()
	handler := NewHandler(store)

	// Routes
	api := r.Group("/api")
	{
		api.GET("/health", handler.HealthCheck)

		gamification := api.Group("/gamification")
		{
			gamification.GET("/level-state", handler.ComputeLevelState)
			gamification.GET("/profile/:userId", handler.GetProfile)
			gamification.GET("/metrics/:userId", handler.GetMetrics)
			gamification.GET("/achievements/:userId", handler.GetAchievements)
			gamification.POST("/award-xp", handler.AwardXP)
			gamification.POST("/daily-login/:userId", handler.AwardDailyLogin)
			gamification.POST("/achievements/seen", handler.MarkAchievementsSeen)
		}
	}

	log.Printf("Gamification Service starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
