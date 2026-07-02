package repository

import (
	"database/sql"
	"fmt"

	_ "github.com/microsoft/go-mssqldb"
	"github.com/vocab-practice/user-go/internal/config"
)

type DB struct {
	*sql.DB
}

func NewDB(cfg *config.DatabaseConfig) (*DB, error) {
	connStr := cfg.DSN()
	db, err := sql.Open("mssql", connStr)
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

func (db *DB) Close() error {
	return db.DB.Close()
}
