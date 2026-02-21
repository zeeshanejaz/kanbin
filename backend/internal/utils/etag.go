package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

// GenerateETag creates a consistent hash from board and task update timestamps
// This allows for conditional GET requests to reduce bandwidth
func GenerateETag(boardUpdatedAt time.Time, tasksUpdatedAt []time.Time) string {
	hasher := sha256.New()

	// Include board updated time
	hasher.Write([]byte(boardUpdatedAt.Format(time.RFC3339Nano)))

	// Include all task updated times (sorted for consistency)
	for _, taskTime := range tasksUpdatedAt {
		hasher.Write([]byte(taskTime.Format(time.RFC3339Nano)))
	}

	hash := hasher.Sum(nil)
	return fmt.Sprintf(`"%s"`, hex.EncodeToString(hash)[:16]) // First 16 chars, wrapped in quotes
}

// ParseETag removes the wrapping quotes from an ETag value
func ParseETag(etag string) string {
	if len(etag) >= 2 && etag[0] == '"' && etag[len(etag)-1] == '"' {
		return etag[1 : len(etag)-1]
	}
	return etag
}
