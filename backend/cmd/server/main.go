package main

import (
	"fmt"

	"github.com/your-org/kanbin/backend/internal/config"
)

func main() {
	cfg := config.Load()
	fmt.Printf("kanbin backend starting on port %s\n", cfg.Port)
	// HTTP server wiring is implemented in the MVP1 backend phase.
}
