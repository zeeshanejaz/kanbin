package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/zeeshanejaz/kanbin/backend/internal/domain"
)

type Router struct {
	*chi.Mux
	boardRepo domain.BoardRepository
	taskRepo  domain.TaskRepository
}

func NewRouter(boardRepo domain.BoardRepository, taskRepo domain.TaskRepository) *Router {
	r := &Router{
		Mux:       chi.NewRouter(),
		boardRepo: boardRepo,
		taskRepo:  taskRepo,
	}

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://localhost:3000", "https://kanbin.app", "https://*.fly.dev"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
	}))

	r.Get("/", func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte("Kanbin API Server"))
	})

	r.Route("/api", func(mux chi.Router) {
		mux.Get("/health", r.handleHealth)
		mux.Post("/boards", r.handleCreateBoard)
		mux.Get("/boards", r.handleSearchBoards)
		mux.Get("/boards/{key}", r.handleGetBoard)
		mux.Delete("/boards/{key}", r.handleDeleteBoard)

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

func generateBoardKey() string {
	b := make([]byte, 4) // 8 hex chars
	rand.Read(b)
	return hex.EncodeToString(b)
}
