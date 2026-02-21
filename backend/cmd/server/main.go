package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"

	"github.com/your-org/kanbin/backend/internal/api"
	"github.com/your-org/kanbin/backend/internal/config"
	"github.com/your-org/kanbin/backend/internal/repository/postgres"
)

func main() {
	cfg := config.Load()

	// Initialize pgxpool
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Unable to ping database: %v", err)
	}

	log.Println("Connected to PostgreSQL via pgxpool")

	// Run migrations
	runMigrations(cfg.DatabaseURL)

	// Initialize Repositories
	boardRepo := postgres.NewBoardRepository(pool)
	taskRepo := postgres.NewTaskRepository(pool)

	// Initialize API Router
	router := api.NewRouter(boardRepo, taskRepo)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Starting Kanbin API server on %s", addr)
	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func runMigrations(dbURL string) {
	// Goose requires standard database/sql
	db, err := sql.Open("pgx", dbURL)
	if err != nil {
		log.Fatalf("Failed to open DB for migrations: %v", err)
	}
	defer db.Close()

	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatalf("Failed to set goose dialect: %v", err)
	}

	// In a real app we might embed these or load from disk.
	// We'll load from disk for local dev.
	log.Println("Running database migrations...")
	if err := goose.Up(db, "migrations"); err != nil {
		log.Fatalf("Migrations failed: %v", err)
	}
	log.Println("Migrations applied successfully.")
}
