package repository

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
	_ "github.com/microsoft/go-mssqldb"
	"github.com/vocab-practice/user-go/internal/config"
)

// DB wraps sqlx.DB to provide both sqlx helpers and backward-compatible sql methods.
type DB struct {
	*sqlx.DB
}

func NewDB(cfg *config.DatabaseConfig) (*DB, error) {
	connStr := cfg.DSN()
	db, err := sqlx.Open("mssql", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &DB{db}, nil
}

// GetContext is a convenience wrapper around sqlx.DB.GetContext for single-row scans.
func (db *DB) GetContext(ctx context.Context, dest interface{}, query string, args ...interface{}) error {
	return db.DB.GetContext(ctx, dest, query, args...)
}

// SelectContext is a convenience wrapper around sqlx.DB.SelectContext for multi-row scans.
func (db *DB) SelectContext(ctx context.Context, dest interface{}, query string, args ...interface{}) error {
	return db.DB.SelectContext(ctx, dest, query, args...)
}
