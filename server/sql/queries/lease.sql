-- name: GetPropertyLeases :many
SELECT l.*, p.*
FROM lease l
JOIN property p ON l.property_id = p.id;

-- name: GetLeasePayments :many
SELECT *
FROM payment 
WHERE lease_id = $1;

-- name: CreateLease :one
INSERT INTO lease (id, property_id, tenant_id, rent, deposit, start_date, end_date)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: CreatePayment :exec
INSERT INTO payment (id, lease_id, amount_due, amount_paid, due_date, payment_date, payment_status)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetLease :one
SELECT * FROM lease WHERE id = $1;
