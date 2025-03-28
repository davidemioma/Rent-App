# Variables
DB_USER ?= postgres
DB_PASSWORD ?= king123
DB_NAME ?= rentify-db
DB_HOST ?= localhost
DB_PORT ?= 5433
SSL_MODE ?= disable
MIGRATIONS_DIR ?= sql/schema

# Connection string
CONNECTION_STRING = "postgres://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=$(SSL_MODE)"

# Migration targets
run-migration-up:
	@echo "Applying migrations..."
	@cd $(MIGRATIONS_DIR) && goose postgres $(CONNECTION_STRING) up
	@echo "Migrations applied successfully!"

run-migration-down:
	@echo "Rolling back migrations..."
	@cd $(MIGRATIONS_DIR) && goose postgres $(CONNECTION_STRING) down
	@echo "Migrations rolled back successfully!"

run-migration-reset:
	@echo "Forcing reset with CASCADE..."
	@cd $(MIGRATIONS_DIR) && \
	for file in *.down.sql; do \
		echo "Executing $${file}..."; \
		psql $(CONNECTION_STRING) -f "$${file}" || true; \
	done
	@echo "All down migrations attempted - verify database state"


# Help target (optional)
help:
	@echo "Available targets:"
	@echo "  run-migration-up    - Apply all migrations"
	@echo "  run-migration-down  - Roll back the latest migration"
	@echo "  run-migration-reset  - Reset all migration"
