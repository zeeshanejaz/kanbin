// Package config manages local CLI configuration persisted on disk.
// In the MVP1 CLI phase, this package will manage ~/.config/kanbin/config.toml,
// storing the user's auth token and preferred server URL.
package config

// Config holds the CLI's local configuration.
type Config struct {
	// ServerURL is the base URL of the kanbin API server.
	ServerURL string

	// Token is the authenticated user's session token (empty for anonymous use).
	Token string
}
