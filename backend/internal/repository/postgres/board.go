package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zeeshanejaz/kanbin/backend/internal/domain"
)

type BoardRepository struct {
	db *pgxpool.Pool
}

func NewBoardRepository(db *pgxpool.Pool) *BoardRepository {
	return &BoardRepository{db: db}
}

func (r *BoardRepository) Create(ctx context.Context, board *domain.Board) error {
	query := `
		INSERT INTO boards (id, key, title, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	err := r.db.QueryRow(ctx, query,
		board.ID, board.Key, board.Title, board.CreatedAt, board.ExpiresAt,
	).Scan(&board.ID)

	if err != nil {
		return err
	}
	return nil
}

func (r *BoardRepository) GetByKey(ctx context.Context, key string) (*domain.Board, error) {
	query := `
		SELECT id, key, title, created_at, expires_at
		FROM boards
		WHERE key = $1
	`
	board := &domain.Board{}
	err := r.db.QueryRow(ctx, query, key).Scan(
		&board.ID, &board.Key, &board.Title, &board.CreatedAt, &board.ExpiresAt,
	)
	if err != nil {
		return nil, err
	}
	return board, nil
}

func (r *BoardRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Board, error) {
	query := `
		SELECT id, key, title, created_at, expires_at
		FROM boards
		WHERE id = $1
	`
	board := &domain.Board{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&board.ID, &board.Key, &board.Title, &board.CreatedAt, &board.ExpiresAt,
	)
	if err != nil {
		return nil, err
	}
	return board, nil
}

func (r *BoardRepository) DeleteByKey(ctx context.Context, key string) error {
	query := `DELETE FROM boards WHERE key = $1`
	_, err := r.db.Exec(ctx, query, key)
	return err
}


