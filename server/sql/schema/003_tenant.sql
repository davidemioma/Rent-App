-- +goose Up
CREATE TABLE tenant (
    id UUID PRIMARY KEY,
    cognito_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phoneNumber TEXT NOT NULL
);

-- +goose Down
DROP TABLE tenant;