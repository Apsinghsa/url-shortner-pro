.PHONY: up down logs restart build clean reset

# Create .env from .env.example on first run and generate a JWT_SECRET if empty.
up:
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env from .env.example"; fi
	@SECRET_LINE=$$(grep '^JWT_SECRET=' .env || echo ""); \
	if [ -z "$$SECRET_LINE" ] || [ "$$SECRET_LINE" = "JWT_SECRET=" ]; then \
		SECRET=$$(openssl rand -hex 32); \
		sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$$SECRET|" .env; \
		echo "Generated JWT_SECRET in .env"; \
	fi
	docker compose up -d --build
	@echo ""
	@echo "Mikku is starting. UI will be at $${PUBLIC_BASE_URL:-http://localhost} (host port $${UI_PORT:-80})."
	@echo "Follow logs with: make logs"

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose restart

build:
	docker compose build

# Stops services and removes containers/network. Keeps the mongo_data volume.
clean:
	docker compose down --remove-orphans

# Stops services, removes containers/network, AND deletes the mongo_data volume.
reset:
	docker compose down --volumes --remove-orphans
