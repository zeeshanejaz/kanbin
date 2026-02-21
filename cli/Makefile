# cli — Go Module Makefile

.PHONY: build run test

BIN := ../bin/kanbin

build:
	@mkdir -p ../bin
	go build -o $(BIN) ./cmd/kanbin/

run:
	go run ./cmd/kanbin/

test:
	go test ./...
