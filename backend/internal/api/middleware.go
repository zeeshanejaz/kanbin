package api

import (
	"net"
	"net/http"
	"os"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// SecurityHeaders adds defensive HTTP response headers to every response.
func SecurityHeaders(next http.Handler) http.Handler {
	production := os.Getenv("PRODUCTION") == "true"
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Content-Security-Policy", "default-src 'none'")
		if production {
			w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
		}
		next.ServeHTTP(w, r)
	})
}

// visitor holds per-IP rate limiters for different operation buckets.
type visitor struct {
	global    *rate.Limiter
	boardGet  *rate.Limiter
	boardPost *rate.Limiter
	lastSeen  time.Time
}

var (
	visitors   = make(map[string]*visitor)
	visitorsMu sync.Mutex
)

func init() {
	// Clean up stale visitor entries every minute.
	go func() {
		for {
			time.Sleep(time.Minute)
			visitorsMu.Lock()
			for ip, v := range visitors {
				if time.Since(v.lastSeen) > 5*time.Minute {
					delete(visitors, ip)
				}
			}
			visitorsMu.Unlock()
		}
	}()
}

func getVisitor(ip string) *visitor {
	visitorsMu.Lock()
	defer visitorsMu.Unlock()
	v, exists := visitors[ip]
	if !exists {
		v = &visitor{
			// 200 requests/minute globally
			global: rate.NewLimiter(rate.Every(time.Minute/200), 200),
			// 60 board GETs/minute
			boardGet: rate.NewLimiter(rate.Every(time.Minute/60), 60),
			// 10 board POSTs/minute
			boardPost: rate.NewLimiter(rate.Every(time.Minute/10), 10),
		}
		visitors[ip] = v
	}
	v.lastSeen = time.Now()
	return v
}

func extractIP(r *http.Request) string {
	// chi/middleware.RealIP has already set RemoteAddr to the real client IP.
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// RateLimit is a middleware factory that picks the appropriate bucket based on
// the HTTP method and path prefix supplied by the caller.
//
// bucket must be one of: "global", "boardGet", "boardPost"
func RateLimit(bucket string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := extractIP(r)
			v := getVisitor(ip)

			var lim *rate.Limiter
			switch bucket {
			case "boardGet":
				lim = v.boardGet
			case "boardPost":
				lim = v.boardPost
			default:
				lim = v.global
			}

			if !lim.Allow() {
				w.Header().Set("Retry-After", "60")
				respondError(w, http.StatusTooManyRequests, "Rate limit exceeded — try again later")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
