package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/zeeshanejaz/kanbin/backend/internal/config"
	"github.com/zeeshanejaz/kanbin/backend/internal/domain"
)

// ─── Mock repositories ────────────────────────────────────────────────────────

type mockBoardRepo struct {
	boards map[string]*domain.Board
}

func newMockBoardRepo() *mockBoardRepo {
	return &mockBoardRepo{boards: make(map[string]*domain.Board)}
}

func (m *mockBoardRepo) Create(_ context.Context, b *domain.Board) error {
	m.boards[b.Key] = b
	return nil
}

func (m *mockBoardRepo) GetByKey(_ context.Context, key string) (*domain.Board, error) {
	b, ok := m.boards[key]
	if !ok {
		return nil, fmt.Errorf("not found")
	}
	return b, nil
}

func (m *mockBoardRepo) GetByID(_ context.Context, id uuid.UUID) (*domain.Board, error) {
	for _, b := range m.boards {
		if b.ID == id {
			return b, nil
		}
	}
	return nil, fmt.Errorf("not found")
}

func (m *mockBoardRepo) DeleteByKey(_ context.Context, key string) error {
	delete(m.boards, key)
	return nil
}

type mockTaskRepo struct {
	tasks map[uuid.UUID]*domain.Task
}

func newMockTaskRepo() *mockTaskRepo {
	return &mockTaskRepo{tasks: make(map[uuid.UUID]*domain.Task)}
}

func (m *mockTaskRepo) Create(_ context.Context, t *domain.Task) error {
	m.tasks[t.ID] = t
	return nil
}

func (m *mockTaskRepo) GetByID(_ context.Context, id uuid.UUID) (*domain.Task, error) {
	t, ok := m.tasks[id]
	if !ok {
		return nil, fmt.Errorf("not found")
	}
	return t, nil
}

func (m *mockTaskRepo) GetByBoardID(_ context.Context, boardID uuid.UUID) ([]*domain.Task, error) {
	var tasks []*domain.Task
	for _, t := range m.tasks {
		if t.BoardID == boardID {
			tasks = append(tasks, t)
		}
	}
	return tasks, nil
}

func (m *mockTaskRepo) Update(_ context.Context, t *domain.Task) error {
	m.tasks[t.ID] = t
	return nil
}

func (m *mockTaskRepo) Delete(_ context.Context, id uuid.UUID) error {
	delete(m.tasks, id)
	return nil
}

func (m *mockTaskRepo) CountByBoardID(_ context.Context, boardID uuid.UUID) (int, error) {
	count := 0
	for _, t := range m.tasks {
		if t.BoardID == boardID {
			count++
		}
	}
	return count, nil
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

func newTestRouter() (*Router, *mockBoardRepo, *mockTaskRepo) {
	br := newMockBoardRepo()
	tr := newMockTaskRepo()
	cfg := &config.Config{
		Port:           "8080",
		AllowedOrigins: []string{"http://localhost:5173"},
	}
	return NewRouter(br, tr, cfg), br, tr
}

func seedBoard(br *mockBoardRepo, key string, expired bool) *domain.Board {
	expiresAt := time.Now().Add(7 * 24 * time.Hour)
	if expired {
		expiresAt = time.Now().Add(-1 * time.Hour)
	}
	b := &domain.Board{
		ID:        uuid.New(),
		Key:       key,
		Title:     "Test Board",
		CreatedAt: time.Now(),
		ExpiresAt: expiresAt,
	}
	br.boards[key] = b
	return b
}

func seedTask(tr *mockTaskRepo, boardID uuid.UUID) *domain.Task {
	t := &domain.Task{
		ID:        uuid.New(),
		BoardID:   boardID,
		Title:     "Test Task",
		Status:    domain.StatusTodo,
		Position:  0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	tr.tasks[t.ID] = t
	return t
}

const testKey = "aabbccdd11223344" // valid 16-char hex key

// ─── Security headers ─────────────────────────────────────────────────────────

func TestSecurityHeaders(t *testing.T) {
	r, _, _ := newTestRouter()
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	cases := []struct{ header, want string }{
		{"X-Content-Type-Options", "nosniff"},
		{"X-Frame-Options", "DENY"},
		{"Referrer-Policy", "strict-origin-when-cross-origin"},
		{"Content-Security-Policy", "default-src 'none'"},
	}
	for _, c := range cases {
		if got := rr.Header().Get(c.header); got != c.want {
			t.Errorf("%s: got %q, want %q", c.header, got, c.want)
		}
	}
}

// ─── Board key entropy ────────────────────────────────────────────────────────

func TestGenerateBoardKey_Length(t *testing.T) {
	key := generateBoardKey()
	if len(key) != 32 {
		t.Errorf("expected 32-char key, got %d chars: %s", len(key), key)
	}
}

func TestGenerateBoardKey_HexOnly(t *testing.T) {
	for i := 0; i < 20; i++ {
		key := generateBoardKey()
		for _, c := range key {
			if !strings.ContainsRune("0123456789abcdef", c) {
				t.Errorf("non-hex character %q in key %s", c, key)
			}
		}
	}
}

func TestGenerateBoardKey_Unique(t *testing.T) {
	seen := make(map[string]bool, 1000)
	for i := 0; i < 1000; i++ {
		k := generateBoardKey()
		if seen[k] {
			t.Fatalf("duplicate key generated at iteration %d: %s", i, k)
		}
		seen[k] = true
	}
}

// ─── Input validation: createBoard ───────────────────────────────────────────

func TestCreateBoard_EmptyTitle_Returns400(t *testing.T) {
	r, _, _ := newTestRouter()
	req := httptest.NewRequest(http.MethodPost, "/api/boards", strings.NewReader(`{"title":""}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rr.Code)
	}
}

func TestCreateBoard_WhitespaceTitle_Returns400(t *testing.T) {
	r, _, _ := newTestRouter()
	req := httptest.NewRequest(http.MethodPost, "/api/boards", strings.NewReader(`{"title":"   "}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rr.Code)
	}
}

func TestCreateBoard_TitleTooLong_Returns400(t *testing.T) {
	r, _, _ := newTestRouter()
	body := `{"title":"` + strings.Repeat("x", 256) + `"}`
	req := httptest.NewRequest(http.MethodPost, "/api/boards", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rr.Code)
	}
}

func TestCreateBoard_ValidTitle_Returns201(t *testing.T) {
	r, _, _ := newTestRouter()
	req := httptest.NewRequest(http.MethodPost, "/api/boards", strings.NewReader(`{"title":"My Board"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusCreated {
		t.Errorf("expected 201, got %d: %s", rr.Code, rr.Body.String())
	}
}

// ─── Input validation: createTask ────────────────────────────────────────────

func TestCreateTask_EmptyTitle_Returns400(t *testing.T) {
	r, br, _ := newTestRouter()
	seedBoard(br, testKey, false)
	req := httptest.NewRequest(http.MethodPost, "/api/boards/"+testKey+"/tasks", strings.NewReader(`{"title":""}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rr.Code)
	}
}

func TestCreateTask_TitleTooLong_Returns400(t *testing.T) {
	r, br, _ := newTestRouter()
	seedBoard(br, testKey, false)
	body := `{"title":"` + strings.Repeat("x", 256) + `"}`
	req := httptest.NewRequest(http.MethodPost, "/api/boards/"+testKey+"/tasks", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rr.Code)
	}
}

func TestCreateTask_DescriptionTooLong_Returns400(t *testing.T) {
	r, br, _ := newTestRouter()
	seedBoard(br, testKey, false)
	body := `{"title":"ok","description":"` + strings.Repeat("x", 10001) + `"}`
	req := httptest.NewRequest(http.MethodPost, "/api/boards/"+testKey+"/tasks", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rr.Code)
	}
}

func TestCreateTask_InvalidStatus_Returns400(t *testing.T) {
	r, br, _ := newTestRouter()
	seedBoard(br, testKey, false)
	req := httptest.NewRequest(http.MethodPost, "/api/boards/"+testKey+"/tasks", strings.NewReader(`{"title":"ok","status":"INVALID"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rr.Code)
	}
}

func TestCreateTask_InvalidBoardKeyFormat_Returns400(t *testing.T) {
	r, _, _ := newTestRouter()
	req := httptest.NewRequest(http.MethodPost, "/api/boards/NOT-HEX!!/tasks", strings.NewReader(`{"title":"ok"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", rr.Code)
	}
}

// ─── Board-ownership check ───────────────────────────────────────────────────

func TestUpdateTask_NoBoardKey_Returns403(t *testing.T) {
	r, br, tr := newTestRouter()
	board := seedBoard(br, testKey, false)
	task := seedTask(tr, board.ID)
	req := httptest.NewRequest(http.MethodPut, "/api/tasks/"+task.ID.String(), strings.NewReader(`{"status":"DONE"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusForbidden {
		t.Errorf("expected 403, got %d", rr.Code)
	}
}

func TestUpdateTask_WrongBoardKey_Returns403(t *testing.T) {
	r, br, tr := newTestRouter()
	board := seedBoard(br, testKey, false)
	task := seedTask(tr, board.ID)
	req := httptest.NewRequest(http.MethodPut, "/api/tasks/"+task.ID.String(), strings.NewReader(`{"status":"DONE"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Board-Key", "0000000000000000") // wrong key
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusForbidden {
		t.Errorf("expected 403, got %d", rr.Code)
	}
}

func TestUpdateTask_CorrectBoardKey_Returns200(t *testing.T) {
	r, br, tr := newTestRouter()
	board := seedBoard(br, testKey, false)
	task := seedTask(tr, board.ID)
	req := httptest.NewRequest(http.MethodPut, "/api/tasks/"+task.ID.String(), strings.NewReader(`{"status":"DONE"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Board-Key", testKey)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d: %s", rr.Code, rr.Body.String())
	}
}

func TestDeleteTask_NoBoardKey_Returns403(t *testing.T) {
	r, br, tr := newTestRouter()
	board := seedBoard(br, testKey, false)
	task := seedTask(tr, board.ID)
	req := httptest.NewRequest(http.MethodDelete, "/api/tasks/"+task.ID.String(), nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusForbidden {
		t.Errorf("expected 403, got %d", rr.Code)
	}
}

func TestDeleteTask_WrongBoardKey_Returns403(t *testing.T) {
	r, br, tr := newTestRouter()
	board := seedBoard(br, testKey, false)
	task := seedTask(tr, board.ID)
	req := httptest.NewRequest(http.MethodDelete, "/api/tasks/"+task.ID.String(), nil)
	req.Header.Set("X-Board-Key", "0000000000000000")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusForbidden {
		t.Errorf("expected 403, got %d", rr.Code)
	}
}

func TestDeleteTask_CorrectBoardKey_Returns200(t *testing.T) {
	r, br, tr := newTestRouter()
	board := seedBoard(br, testKey, false)
	task := seedTask(tr, board.ID)
	req := httptest.NewRequest(http.MethodDelete, "/api/tasks/"+task.ID.String(), nil)
	req.Header.Set("X-Board-Key", testKey)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}
}

func TestDeleteTask_DifferentBoard_Returns403(t *testing.T) {
	r, br, tr := newTestRouter()
	boardA := seedBoard(br, testKey, false)
	seedBoard(br, "bbbbbbbbbbbbbbbb", false)
	task := seedTask(tr, boardA.ID)
	// Try to delete task from board A using board B's key
	req := httptest.NewRequest(http.MethodDelete, "/api/tasks/"+task.ID.String(), nil)
	req.Header.Set("X-Board-Key", "bbbbbbbbbbbbbbbb")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusForbidden {
		t.Errorf("expected 403 when using wrong board key, got %d", rr.Code)
	}
}

// ─── Expired board checks ─────────────────────────────────────────────────────

func TestCreateTask_ExpiredBoard_Returns410(t *testing.T) {
	r, br, _ := newTestRouter()
	seedBoard(br, testKey, true)
	req := httptest.NewRequest(http.MethodPost, "/api/boards/"+testKey+"/tasks", strings.NewReader(`{"title":"My task"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusGone {
		t.Errorf("expected 410, got %d", rr.Code)
	}
}

func TestUpdateTask_ExpiredBoard_Returns410(t *testing.T) {
	r, br, tr := newTestRouter()
	board := seedBoard(br, testKey, true)
	task := seedTask(tr, board.ID)
	req := httptest.NewRequest(http.MethodPut, "/api/tasks/"+task.ID.String(), strings.NewReader(`{"status":"DONE"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Board-Key", testKey)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusGone {
		t.Errorf("expected 410, got %d", rr.Code)
	}
}

func TestDeleteTask_ExpiredBoard_Returns410(t *testing.T) {
	r, br, tr := newTestRouter()
	board := seedBoard(br, testKey, true)
	task := seedTask(tr, board.ID)
	req := httptest.NewRequest(http.MethodDelete, "/api/tasks/"+task.ID.String(), nil)
	req.Header.Set("X-Board-Key", testKey)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusGone {
		t.Errorf("expected 410, got %d", rr.Code)
	}
}

// ─── Search endpoint removed ─────────────────────────────────────────────────

func TestSearchEndpoint_Returns404(t *testing.T) {
	r, _, _ := newTestRouter()
	req := httptest.NewRequest(http.MethodGet, "/api/boards?q=test", nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	// chi returns 405 (no GET /boards route) rather than 404; either means the endpoint is gone.
	if rr.Code == http.StatusOK {
		t.Errorf("search endpoint must not return 200 — it has been removed")
	}
}

// ─── Internal UUID not exposed ───────────────────────────────────────────────

func TestGetBoard_HidesInternalID(t *testing.T) {
	r, br, _ := newTestRouter()
	seedBoard(br, testKey, false)
	req := httptest.NewRequest(http.MethodGet, "/api/boards/"+testKey, nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	var resp map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if _, ok := resp["id"]; ok {
		t.Error("board 'id' field must not be present in JSON response")
	}
}

func TestCreateTask_HidesBoardID(t *testing.T) {
	r, br, _ := newTestRouter()
	seedBoard(br, testKey, false)
	req := httptest.NewRequest(http.MethodPost, "/api/boards/"+testKey+"/tasks", strings.NewReader(`{"title":"My task"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rr.Code, rr.Body.String())
	}
	var resp map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if _, ok := resp["board_id"]; ok {
		t.Error("task 'board_id' field must not be present in JSON response")
	}
}
