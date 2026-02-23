package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

var baseURLOverride string

func SetBaseURL(url string) {
	baseURLOverride = url
}

func getBaseURL() string {
	if baseURLOverride != "" {
		return baseURLOverride
	}
	if url := os.Getenv("KANBIN_URL"); url != "" {
		return url
	}
	return "https://api.kanbin.app/api"
}

func parseResponse(resp *http.Response, target interface{}) error {
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if resp.StatusCode >= 400 {
		var errResp struct {
			Error string `json:"error"`
		}
		if err := json.Unmarshal(body, &errResp); err == nil && errResp.Error != "" {
			return fmt.Errorf("API Error: %s", errResp.Error)
		}
		return fmt.Errorf("API request failed with status HTTP %d", resp.StatusCode)
	}

	if target != nil {
		if err := json.Unmarshal(body, target); err != nil {
			return err
		}
	}
	return nil
}

func doRequest(method, path string, payload interface{}, target interface{}, extraHeaders ...map[string]string) error {
	url := getBaseURL() + path
	var bodyReader io.Reader

	if payload != nil {
		data, err := json.Marshal(payload)
		if err != nil {
			return err
		}
		bodyReader = bytes.NewReader(data)
	}

	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	if len(extraHeaders) > 0 {
		for k, v := range extraHeaders[0] {
			req.Header.Set(k, v)
		}
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	return parseResponse(resp, target)
}

func Get(path string, target interface{}) error {
	return doRequest(http.MethodGet, path, nil, target)
}

func Post(path string, payload interface{}, target interface{}) error {
	return doRequest(http.MethodPost, path, payload, target)
}

// Put sends a PUT request. Pass an optional map as the last argument to include extra headers
// (e.g. {"X-Board-Key": key} for task mutation endpoints).
func Put(path string, payload interface{}, target interface{}, extraHeaders ...map[string]string) error {
	return doRequest(http.MethodPut, path, payload, target, extraHeaders...)
}

// Delete sends a DELETE request. Pass an optional map as the last argument to include extra headers.
func Delete(path string, target interface{}, extraHeaders ...map[string]string) error {
	return doRequest(http.MethodDelete, path, nil, target, extraHeaders...)
}
