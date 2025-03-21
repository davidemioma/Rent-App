-- +goose Up
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'PARTILLYPAID', 'OVERDUE');

CREATE TABLE payment (
    id UUID PRIMARY KEY,
    lease_id UUID NOT NULL REFERENCES lease(id) ON DELETE CASCADE,
    amount_due NUMERIC NOT NULL,
    amount_paid NUMERIC NOT NULL, 
    due_date TIMESTAMP NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    payment_status payment_status NOT NULL
);

-- +goose Down
DROP TABLE payment;
DROP TYPE payment_status;