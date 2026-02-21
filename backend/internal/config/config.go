package config

import (
	"os"
)

// Config holds all the application configuration.
type Config struct {
	Port        string
	DatabaseURL string
}

// Load reads configuration from environment variables.
func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://kanbin:kanbin@localhost:5432/kanbin_dev"
	}

	return &Config{
		Port:        port,
		DatabaseURL: dbURL,
	}
}
