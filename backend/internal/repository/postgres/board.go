package postgres

import (
	"context"

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

func (r *BoardRepository) DeleteByKey(ctx context.Context, key string) error {
	query := `DELETE FROM boards WHERE key = $1`
	_, err := r.db.Exec(ctx, query, key)
	return err
}

func (r *BoardRepository) Search(ctx context.Context, query string) ([]*domain.Board, error) {
	sqlQuery := `
		SELECT id, key, title, created_at, expires_at
		FROM boards
		WHERE title ILIKE $1
		ORDER BY created_at DESC
		LIMIT 50
	`
	rows, err := r.db.Query(ctx, sqlQuery, "%"+query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var boards []*domain.Board
	for rows.Next() {
		board := &domain.Board{}
		if err := rows.Scan(
			&board.ID, &board.Key, &board.Title, &board.CreatedAt, &board.ExpiresAt,
		); err != nil {
			return nil, err
		}
		boards = append(boards, board)
	}
	return boards, rows.Err()
}
