package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// TaskStatus represents the current state of a task.
type TaskStatus string

const (
	StatusTodo       TaskStatus = "TODO"
	StatusInProgress TaskStatus = "IN_PROGRESS"
	StatusDone       TaskStatus = "DONE"
)

// Task represents an item of work on a board.
type Task struct {
	ID          uuid.UUID  `json:"id"`
	BoardID     uuid.UUID  `json:"-"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      TaskStatus `json:"status"`
	Position    int        `json:"position"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// TaskRepository defines the interface for interacting with task data.
type TaskRepository interface {
	Create(ctx context.Context, task *Task) error
	GetByID(ctx context.Context, id uuid.UUID) (*Task, error)
	GetByBoardID(ctx context.Context, boardID uuid.UUID) ([]*Task, error)
	Update(ctx context.Context, task *Task) error
	Delete(ctx context.Context, id uuid.UUID) error
	CountByBoardID(ctx context.Context, boardID uuid.UUID) (int, error)
}
