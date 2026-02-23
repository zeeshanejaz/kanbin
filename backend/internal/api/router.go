package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/zeeshanejaz/kanbin/backend/internal/config"
	"github.com/zeeshanejaz/kanbin/backend/internal/domain"
)

type Router struct {
	*chi.Mux
	boardRepo domain.BoardRepository
	taskRepo  domain.TaskRepository
}

// NewRouter constructs the chi router with all middleware and routes registered.
func NewRouter(boardRepo domain.BoardRepository, taskRepo domain.TaskRepository, cfg *config.Config) *Router {
	r := &Router{
		Mux:       chi.NewRouter(),
		boardRepo: boardRepo,
		taskRepo:  taskRepo,
	}

	// Middleware order: security headers → rate limit → CORS → logging/recovery
	r.Use(SecurityHeaders)
	r.Use(RateLimit("global"))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: cfg.AllowedOrigins,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Board-Key"},
		ExposedHeaders: []string{"ETag"},
	}))

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/", func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte("Kanbin API Server"))
	})

	r.Route("/api", func(mux chi.Router) {
		mux.Get("/health", r.handleHealth)

		// Board routes — per-operation rate limits
		mux.With(RateLimit("boardPost")).Post("/boards", r.handleCreateBoard)
		mux.With(RateLimit("boardGet")).Get("/boards/{key}", r.handleGetBoard)
		mux.Delete("/boards/{key}", r.handleDeleteBoard)

		// Task routes
		mux.Post("/boards/{key}/tasks", r.handleCreateTask)
		mux.Put("/tasks/{id}", r.handleUpdateTask)
		mux.Delete("/tasks/{id}", r.handleDeleteTask)
	})

	return r
}

// Helpers
func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

// generateBoardKey produces a cryptographically random 32-character hex string
// (16 bytes of entropy), raising the brute-force search space to ~3.4×10^38.
func generateBoardKey() string {
	b := make([]byte, 16) // 32 hex chars
	rand.Read(b)
	return hex.EncodeToString(b)
}
