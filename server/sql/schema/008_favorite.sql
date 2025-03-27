-- +goose Up
CREATE TABLE favorite (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- +goose Down
DROP TABLE favorite;