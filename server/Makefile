# Load .env.postgres (fail if missing)
ifneq (,$(wildcard .env))
include .env
export $(shell sed 's/=.*//' .env)
else
$(error ".env file is missing. Create it from .env")
endif

# Validate required variables
REQUIRED_VARS := POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB

$(foreach var,$(REQUIRED_VARS),\
  $(if $($(var)),,$(error "$(var) is not set in .env")))

# Variables with defaults for non-critical options
DB_USER ?= $(POSTGRES_USER)
DB_PASSWORD ?= $(POSTGRES_PASSWORD)
DB_NAME ?= $(POSTGRES_DB)
DB_HOST ?= $(or $(POSTGRES_HOST),localhost)
DB_PORT ?= $(or $(POSTGRES_PORT),5433)
MIGRATIONS_DIR ?= sql/schema

# URL-encode credentials
ENCODED_DB_USER := $(shell echo '$(DB_USER)' | sed 's/:/%3A/g')
ENCODED_DB_PASSWORD := $(shell echo '$(DB_PASSWORD)' | sed 's/:/%3A/g')

# Connection string
CONNECTION_STRING = "postgres://$(ENCODED_DB_USER):$(ENCODED_DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)"

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

help:
	@echo "Available targets:"
	@echo "  run-migration-up    - Apply all migrations"
	@echo "  run-migration-down  - Roll back the latest migration"
	@echo "  run-migration-reset - Reset all migrations (DANGER: destructive)"