package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port      string
	Database  DatabaseConfig
	JWTSecret string
}

type DatabaseConfig struct {
	Server   string
	Port     string
	User     string
	Password string
	Database string
	Instance string
}

func (d DatabaseConfig) DSN() string {
	if d.Instance != "" {
		return fmt.Sprintf("server=%s\\%s;port=%s;user id=%s;password=%s;database=%s",
			d.Server, d.Instance, d.Port, d.User, d.Password, d.Database)
	}
	return fmt.Sprintf("server=%s;port=%s;user id=%s;password=%s;database=%s",
		d.Server, d.Port, d.User, d.Password, d.Database)
}

func Load() (*Config, error) {
	// Try loading from both CWDs: Express spawns from backend/, go run from user-go/
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	cfg := &Config{
		Port:      getEnv("GO_PORT", "3002"),
		JWTSecret: os.Getenv("JWT_SECRET"),
		Database: DatabaseConfig{
			Server:   getEnv("DB_SERVER", "127.0.0.1"),
			Port:     getEnv("DB_PORT", "1434"),
			User:     getEnv("DB_USER", "sa"),
			Password: os.Getenv("DB_PASSWORD"),
			Database: getEnv("DB_DATABASE", getEnv("DB_NAME", "ToeicVocabularyPlatform")),
			Instance: os.Getenv("DB_INSTANCE"),
		},
	}

	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
