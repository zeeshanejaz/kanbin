package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// Board represents a kanban board.
type Board struct {
	ID        uuid.UUID `json:"id"`
	Key       string    `json:"key"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

// BoardRepository defines the interface for interacting with board data.
type BoardRepository interface {
	Create(ctx context.Context, board *Board) error
	GetByKey(ctx context.Context, key string) (*Board, error)
	DeleteByKey(ctx context.Context, key string) error
	Search(ctx context.Context, query string) ([]*Board, error)
}
