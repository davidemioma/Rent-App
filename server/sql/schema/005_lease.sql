-- +goose Up
CREATE TABLE lease (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    rent NUMERIC NOT NULL,
    deposit NUMERIC NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL
);

-- +goose Down
DROP TABLE lease;