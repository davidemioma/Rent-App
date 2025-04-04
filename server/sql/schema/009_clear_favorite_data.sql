-- +goose Up
-- Clears ALL data while preserving table structure, indexes, and constraints
TRUNCATE TABLE favorite RESTART IDENTITY CASCADE;

-- +goose Down
-- WARNING: Data deletion cannot be undone in the down migration
-- (This is left empty since TRUNCATE is irreversible)