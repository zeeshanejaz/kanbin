package api

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/zeeshanejaz/kanbin/backend/internal/domain"
	"github.com/zeeshanejaz/kanbin/backend/internal/utils"
)

// boardKeyRe matches valid board key strings: 8–64 lowercase hex characters.
var boardKeyRe = regexp.MustCompile(`^[0-9a-f]{8,64}$`)

// isValidStatus reports whether s is a valid TaskStatus value.
func isValidStatus(s domain.TaskStatus) bool {
	return s == domain.StatusTodo || s == domain.StatusInProgress || s == domain.StatusDone
}

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
	Title       *string            `json:"title,omitempty"`
	Description *string            `json:"description,omitempty"`
	Status      *domain.TaskStatus `json:"status,omitempty"`
	Position    *int               `json:"position,omitempty"`
}

// Handlers
func (r *Router) handleHealth(w http.ResponseWriter, req *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"message": "Kanbin API is live",
		"version": "1.0.0",
	})
}

func (r *Router) handleCreateBoard(w http.ResponseWriter, req *http.Request) {
	var reqBody CreateBoardReq
	if err := json.NewDecoder(req.Body).Decode(&reqBody); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if strings.TrimSpace(reqBody.Title) == "" {
		respondError(w, http.StatusBadRequest, "Title is required")
		return
	}
	if len(reqBody.Title) > 255 {
		respondError(w, http.StatusBadRequest, "Title must be 255 characters or fewer")
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

	// Generate ETag from board and task timestamps
	taskTimes := make([]time.Time, len(tasks))
	for i, task := range tasks {
		taskTimes[i] = task.UpdatedAt
	}
	etag := utils.GenerateETag(board.CreatedAt, taskTimes)

	// Check If-None-Match header
	ifNoneMatch := req.Header.Get("If-None-Match")
	if ifNoneMatch != "" && ifNoneMatch == etag {
		// Data hasn't changed, return 304 Not Modified
		w.Header().Set("ETag", etag)
		w.WriteHeader(http.StatusNotModified)
		return
	}

	// Set ETag header and return data
	w.Header().Set("ETag", etag)
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

func (r *Router) handleCreateTask(w http.ResponseWriter, req *http.Request) {
	key := chi.URLParam(req, "key")
	if !boardKeyRe.MatchString(key) {
		respondError(w, http.StatusBadRequest, "Invalid board key format")
		return
	}

	board, err := r.boardRepo.GetByKey(req.Context(), key)
	if err != nil {
		respondError(w, http.StatusNotFound, "Board not found")
		return
	}

	// Check expiry
	if time.Now().After(board.ExpiresAt) {
		respondError(w, http.StatusGone, "Board has expired")
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

	if strings.TrimSpace(reqBody.Title) == "" {
		respondError(w, http.StatusBadRequest, "Title is required")
		return
	}
	if len(reqBody.Title) > 255 {
		respondError(w, http.StatusBadRequest, "Title must be 255 characters or fewer")
		return
	}
	if len(reqBody.Description) > 10000 {
		respondError(w, http.StatusBadRequest, "Description must be 10,000 characters or fewer")
		return
	}

	if reqBody.Status == "" {
		reqBody.Status = domain.StatusTodo
	} else if !isValidStatus(reqBody.Status) {
		respondError(w, http.StatusBadRequest, "Status must be one of: TODO, IN_PROGRESS, DONE")
		return
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

	// Board-ownership verification: require the board key in X-Board-Key header.
	boardKey := req.Header.Get("X-Board-Key")
	if boardKey == "" {
		respondError(w, http.StatusForbidden, "X-Board-Key header is required")
		return
	}

	task, err := r.taskRepo.GetByID(req.Context(), id)
	if err != nil {
		// Return 403 to avoid confirming whether the task exists.
		respondError(w, http.StatusForbidden, "Forbidden")
		return
	}

	board, err := r.boardRepo.GetByID(req.Context(), task.BoardID)
	if err != nil || board.Key != boardKey {
		respondError(w, http.StatusForbidden, "Forbidden")
		return
	}

	// Check expiry
	if time.Now().After(board.ExpiresAt) {
		respondError(w, http.StatusGone, "Board has expired")
		return
	}

	var reqBody UpdateTaskReq
	if err := json.NewDecoder(req.Body).Decode(&reqBody); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Only update fields that are provided (partial update support)
	if reqBody.Title != nil {
		if strings.TrimSpace(*reqBody.Title) == "" {
			respondError(w, http.StatusBadRequest, "Title cannot be empty")
			return
		}
		if len(*reqBody.Title) > 255 {
			respondError(w, http.StatusBadRequest, "Title must be 255 characters or fewer")
			return
		}
		task.Title = *reqBody.Title
	}
	if reqBody.Description != nil {
		if len(*reqBody.Description) > 10000 {
			respondError(w, http.StatusBadRequest, "Description must be 10,000 characters or fewer")
			return
		}
		task.Description = *reqBody.Description
	}
	if reqBody.Status != nil {
		if !isValidStatus(*reqBody.Status) {
			respondError(w, http.StatusBadRequest, "Status must be one of: TODO, IN_PROGRESS, DONE")
			return
		}
		task.Status = *reqBody.Status
	}
	if reqBody.Position != nil {
		task.Position = *reqBody.Position
	}
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

	// Board-ownership verification: require the board key in X-Board-Key header.
	boardKey := req.Header.Get("X-Board-Key")
	if boardKey == "" {
		respondError(w, http.StatusForbidden, "X-Board-Key header is required")
		return
	}

	task, err := r.taskRepo.GetByID(req.Context(), id)
	if err != nil {
		// Return 403 to avoid confirming whether the task exists.
		respondError(w, http.StatusForbidden, "Forbidden")
		return
	}

	board, err := r.boardRepo.GetByID(req.Context(), task.BoardID)
	if err != nil || board.Key != boardKey {
		respondError(w, http.StatusForbidden, "Forbidden")
		return
	}

	// Check expiry
	if time.Now().After(board.ExpiresAt) {
		respondError(w, http.StatusGone, "Board has expired")
		return
	}

	if err := r.taskRepo.Delete(req.Context(), id); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete task")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "deleted"})
}
