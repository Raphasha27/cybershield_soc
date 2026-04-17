# ─────────────────────────────────────────────────────────
# CyberShield SOC — Developer Makefile
# Kirov Dynamics Engineering Standard
# ─────────────────────────────────────────────────────────

.PHONY: help dev build test lint docker-up docker-down clean

help:
	@echo ""
	@echo "  CyberShield SOC — Available Commands"
	@echo "  ─────────────────────────────────────────────"
	@echo "  make dev          Start frontend (Angular) and backend (Node.js) in dev mode"
	@echo "  make build        Build production artifacts"
	@echo "  make test         Run all tests"
	@echo "  make lint         Run linting checks"
	@echo "  make docker-up    Start full stack via docker-compose"
	@echo "  make docker-down  Tear down docker stack"
	@echo "  make clean        Remove build artifacts and caches"
	@echo ""

# ─── Development ─────────────────────────────────────────
dev:
	@echo "Starting backend and frontend..."
	@(cd server && npm install && npm start) &
	@(npm install && npm start) &
	@wait

# ─── Build ───────────────────────────────────────────────
build:
	@echo "Building frontend..."
	npm run build --prod
	@echo "Building server..."
	cd server && npm install

# ─── Testing ─────────────────────────────────────────────
test:
	@echo "Running frontend tests..."
	npm test -- --watch=false
	@echo "Running backend tests..."
	cd server && npm test

# ─── Linting ─────────────────────────────────────────────
lint:
	@echo "Linting frontend..."
	npm run lint
	@echo "Linting server..."
	cd server && npm run lint

# ─── Docker ──────────────────────────────────────────────
docker-up:
	docker-compose up --build -d
	@echo "✅ SOC Dashboard running: http://localhost:80"

docker-down:
	docker-compose down -v
	@echo "🛑 SOC stack stopped."

# ─── Cleanup ─────────────────────────────────────────────
clean:
	@echo "→ Cleaning node_modules and build artifacts..."
	rm -rf node_modules
	rm -rf server/node_modules
	rm -rf dist
	@echo "✅ Cleaned."
