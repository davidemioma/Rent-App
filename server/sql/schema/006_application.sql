-- +goose Up
CREATE TYPE application_status AS ENUM ('PENDING', 'DENIED', 'APPROVED');

CREATE TABLE application (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    lease_id UUID REFERENCES lease(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    message TEXT,
    status application_status NOT NULL,
    application_date TIMESTAMP NOT NULL
);

-- +goose Down
DROP TABLE application;
DROP TYPE application_status;