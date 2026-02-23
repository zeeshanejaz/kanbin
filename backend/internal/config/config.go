package config

import (
	"log"
	"os"
	"strings"
)

// Config holds all the application configuration.
type Config struct {
	Port           string
	DatabaseURL    string
	AllowedOrigins []string
}

// Load reads configuration from environment variables.
// It terminates the process with a fatal error if required variables are missing.
func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required but not set")
	}

	// ALLOWED_ORIGINS is a comma-separated list of origins permitted for CORS.
	// Defaults to localhost ports used in development.
	allowedOriginsRaw := os.Getenv("ALLOWED_ORIGINS")
	if allowedOriginsRaw == "" {
		allowedOriginsRaw = "http://localhost:5173,http://localhost:3000"
	}
	allowedOrigins := strings.Split(allowedOriginsRaw, ",")
	for i, o := range allowedOrigins {
		allowedOrigins[i] = strings.TrimSpace(o)
	}

	return &Config{
		Port:           port,
		DatabaseURL:    dbURL,
		AllowedOrigins: allowedOrigins,
	}
}
