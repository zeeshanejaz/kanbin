package utils

import (
	"testing"
	"time"
)

func TestGenerateETag(t *testing.T) {
	now := time.Now()

	t.Run("consistent hash for same input", func(t *testing.T) {
		tasks := []time.Time{now, now.Add(time.Hour)}

		etag1 := GenerateETag(now, tasks)
		etag2 := GenerateETag(now, tasks)

		if etag1 != etag2 {
			t.Errorf("Expected consistent ETags, got %s and %s", etag1, etag2)
		}
	})

	t.Run("different hash for different board time", func(t *testing.T) {
		tasks := []time.Time{now}

		etag1 := GenerateETag(now, tasks)
		etag2 := GenerateETag(now.Add(time.Second), tasks)

		if etag1 == etag2 {
			t.Error("Expected different ETags for different board times")
		}
	})

	t.Run("different hash for different tasks", func(t *testing.T) {
		tasks1 := []time.Time{now}
		tasks2 := []time.Time{now, now.Add(time.Hour)}

		etag1 := GenerateETag(now, tasks1)
		etag2 := GenerateETag(now, tasks2)

		if etag1 == etag2 {
			t.Error("Expected different ETags for different task lists")
		}
	})

	t.Run("etag is quoted", func(t *testing.T) {
		etag := GenerateETag(now, []time.Time{})

		if len(etag) < 2 || etag[0] != '"' || etag[len(etag)-1] != '"' {
			t.Errorf("Expected quoted ETag, got %s", etag)
		}
	})
}

func TestParseETag(t *testing.T) {
	t.Run("removes quotes", func(t *testing.T) {
		etag := `"abc123"`
		parsed := ParseETag(etag)

		if parsed != "abc123" {
			t.Errorf("Expected 'abc123', got '%s'", parsed)
		}
	})

	t.Run("handles unquoted", func(t *testing.T) {
		etag := "abc123"
		parsed := ParseETag(etag)

		if parsed != "abc123" {
			t.Errorf("Expected 'abc123', got '%s'", parsed)
		}
	})

	t.Run("handles empty", func(t *testing.T) {
		parsed := ParseETag("")
		if parsed != "" {
			t.Errorf("Expected empty string, got '%s'", parsed)
		}
	})
}
