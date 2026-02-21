package config

import (
	"os"
)

// Config holds all runtime configuration for the backend server.
// Values are loaded from environment variables with sensible defaults.
type Config struct {
	// Port is the TCP port the HTTP server listens on.
	Port string

	// DatabaseURL is the PostgreSQL connection string.
	DatabaseURL string
}

// Load reads configuration from environment variables.
func Load() Config {
	return Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://user:password@localhost:5432/kanbin"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
