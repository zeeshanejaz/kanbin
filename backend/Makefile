# backend — Go Module Makefile

.PHONY: build run test lint

BIN := ../bin/server

build:
	@mkdir -p ../bin
	go build -o $(BIN) ./cmd/server/

run:
	go run ./cmd/server/

test:
	go test ./...

lint:
	golangci-lint run ./...
