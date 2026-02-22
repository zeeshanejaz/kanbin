package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/zeeshanejaz/kanbin/backend/internal/domain"
)

type TaskRepository struct {
	db *pgxpool.Pool
}

func NewTaskRepository(db *pgxpool.Pool) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) Create(ctx context.Context, task *domain.Task) error {
	query := `
		INSERT INTO tasks (id, board_id, title, description, status, position, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`
	err := r.db.QueryRow(ctx, query,
		task.ID, task.BoardID, task.Title, task.Description, task.Status, task.Position, task.CreatedAt, task.UpdatedAt,
	).Scan(&task.ID)

	return err
}

func (r *TaskRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Task, error) {
	query := `
		SELECT id, board_id, title, description, status, position, created_at, updated_at
		FROM tasks
		WHERE id = $1
	`
	task := &domain.Task{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&task.ID, &task.BoardID, &task.Title, &task.Description, &task.Status, &task.Position, &task.CreatedAt, &task.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return task, nil
}

func (r *TaskRepository) GetByBoardID(ctx context.Context, boardID uuid.UUID) ([]*domain.Task, error) {
	query := `
		SELECT id, board_id, title, description, status, position, created_at, updated_at
		FROM tasks
		WHERE board_id = $1
		ORDER BY status, position
	`
	rows, err := r.db.Query(ctx, query, boardID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*domain.Task
	for rows.Next() {
		task := &domain.Task{}
		if err := rows.Scan(
			&task.ID, &task.BoardID, &task.Title, &task.Description, &task.Status, &task.Position, &task.CreatedAt, &task.UpdatedAt,
		); err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	return tasks, rows.Err()
}

func (r *TaskRepository) Update(ctx context.Context, task *domain.Task) error {
	query := `
		UPDATE tasks
		SET title = $1, description = $2, status = $3, position = $4, updated_at = $5
		WHERE id = $6
	`
	_, err := r.db.Exec(ctx, query,
		task.Title, task.Description, task.Status, task.Position, task.UpdatedAt, task.ID,
	)
	return err
}

func (r *TaskRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM tasks WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *TaskRepository) CountByBoardID(ctx context.Context, boardID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM tasks WHERE board_id = $1`
	var count int
	err := r.db.QueryRow(ctx, query, boardID).Scan(&count)
	return count, err
}
