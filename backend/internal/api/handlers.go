package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/your-org/kanbin/backend/internal/domain"
)

// DTOs
type CreateBoardReq struct {
	Title string `json:"title"`
}

type BoardResponse struct {
	*domain.Board
	Tasks []*domain.Task `json:"tasks"`
}

type CreateTaskReq struct {
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Status      domain.TaskStatus `json:"status"`
}

type UpdateTaskReq struct {
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Status      domain.TaskStatus `json:"status"`
	Position    int               `json:"position"`
}

// Handlers
func (r *Router) handleCreateBoard(w http.ResponseWriter, req *http.Request) {
	var reqBody CreateBoardReq
	if err := json.NewDecoder(req.Body).Decode(&reqBody); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	board := &domain.Board{
		ID:        uuid.New(),
		Key:       generateBoardKey(),
		Title:     reqBody.Title,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().AddDate(0, 0, 7), // 7 days expiry
	}

	if err := r.boardRepo.Create(req.Context(), board); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create board")
		return
	}

	respondJSON(w, http.StatusCreated, board)
}

func (r *Router) handleGetBoard(w http.ResponseWriter, req *http.Request) {
	key := chi.URLParam(req, "key")
	if key == "" {
		respondError(w, http.StatusBadRequest, "Board key is required")
		return
	}

	board, err := r.boardRepo.GetByKey(req.Context(), key)
	if err != nil {
		// Better error handling for Not Found in production
		respondError(w, http.StatusNotFound, "Board not found")
		return
	}

	// Check expiry
	if time.Now().After(board.ExpiresAt) {
		respondError(w, http.StatusGone, "Board has expired")
		return
	}

	tasks, err := r.taskRepo.GetByBoardID(req.Context(), board.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch tasks")
		return
	}

	// Make sure tasks is not nil for JSON response even if empty
	if tasks == nil {
		tasks = []*domain.Task{}
	}

	respondJSON(w, http.StatusOK, BoardResponse{
		Board: board,
		Tasks: tasks,
	})
}

func (r *Router) handleDeleteBoard(w http.ResponseWriter, req *http.Request) {
	key := chi.URLParam(req, "key")
	if err := r.boardRepo.DeleteByKey(req.Context(), key); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete board")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "deleted"})
}

func (r *Router) handleSearchBoards(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query().Get("q")
	if query == "" {
		respondJSON(w, http.StatusOK, make([]*domain.Board, 0))
		return
	}

	boards, err := r.boardRepo.Search(req.Context(), query)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Search failed")
		return
	}

	if boards == nil {
		boards = make([]*domain.Board, 0)
	}

	respondJSON(w, http.StatusOK, boards)
}

func (r *Router) handleCreateTask(w http.ResponseWriter, req *http.Request) {
	key := chi.URLParam(req, "key")
	board, err := r.boardRepo.GetByKey(req.Context(), key)
	if err != nil {
		respondError(w, http.StatusNotFound, "Board not found")
		return
	}

	// Check limits
	count, err := r.taskRepo.CountByBoardID(req.Context(), board.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to check task limit")
		return
	}
	if count >= 100 {
		respondError(w, http.StatusUnprocessableEntity, "Task limit reached (100)")
		return
	}

	var reqBody CreateTaskReq
	if err := json.NewDecoder(req.Body).Decode(&reqBody); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if reqBody.Status == "" {
		reqBody.Status = domain.StatusTodo
	}

	task := &domain.Task{
		ID:          uuid.New(),
		BoardID:     board.ID,
		Title:       reqBody.Title,
		Description: reqBody.Description,
		Status:      reqBody.Status,
		Position:    count, // append to end
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := r.taskRepo.Create(req.Context(), task); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create task")
		return
	}

	respondJSON(w, http.StatusCreated, task)
}

func (r *Router) handleUpdateTask(w http.ResponseWriter, req *http.Request) {
	idStr := chi.URLParam(req, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid task ID format")
		return
	}

	var reqBody UpdateTaskReq
	if err := json.NewDecoder(req.Body).Decode(&reqBody); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	task, err := r.taskRepo.GetByID(req.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "Task not found")
		return
	}

	task.Title = reqBody.Title
	task.Description = reqBody.Description
	task.Status = reqBody.Status
	task.Position = reqBody.Position
	task.UpdatedAt = time.Now()

	if err := r.taskRepo.Update(req.Context(), task); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update task")
		return
	}

	respondJSON(w, http.StatusOK, task)
}

func (r *Router) handleDeleteTask(w http.ResponseWriter, req *http.Request) {
	idStr := chi.URLParam(req, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid task ID format")
		return
	}

	if err := r.taskRepo.Delete(req.Context(), id); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete task")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "deleted"})
}
