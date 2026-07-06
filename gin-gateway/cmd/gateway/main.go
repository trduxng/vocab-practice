package main

import (
	"log"
	"net/url"
	"os"
	"strings"

	"gin-gateway/internal/ai"
	"gin-gateway/internal/middleware"
	"gin-gateway/internal/proxy"

	"github.com/gin-gonic/gin"
)

func main() {
	upstream := os.Getenv("UPSTREAM_URL")
	if upstream == "" {
		upstream = "http://localhost:3001"
	}

	target, err := url.Parse(upstream)
	if err != nil {
		log.Fatalf("invalid UPSTREAM_URL %q: %v", upstream, err)
	}

	r := gin.Default()

	proxyHandler := proxy.ReverseProxy(target)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// AI module — xử lý native, không proxy
	aiService := ai.NewService()
	aiHandler := ai.NewHandler(aiService)
	aiGroup := r.Group("/api/ai")
	aiGroup.Use(middleware.VerifyToken())
	aiGroup.Use(middleware.RequirePermission("MANAGE_WORDS", "MANAGE_QUESTIONS"))
	{
		aiGroup.POST("/word-suggestions", aiHandler.SuggestWordContent)
	}

	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") || strings.HasPrefix(path, "/uploads") {
			proxyHandler(c)
			return
		}
		c.JSON(404, gin.H{"message": "not found"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Gin gateway listening on :%s → upstream %s", port, upstream)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
