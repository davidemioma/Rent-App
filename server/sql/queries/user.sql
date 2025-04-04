-- name: CreateManager :one
INSERT INTO manager (id, cognito_id, name, email, phoneNumber)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: CreateTenant :one
INSERT INTO tenant (id, cognito_id, name, email, phoneNumber)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetManagerByCognitoId :one
SELECT * FROM manager WHERE cognito_id = $1;

-- name: GetTenantByCognitoId :one
SELECT * FROM tenant WHERE cognito_id = $1;

-- name: UpdateTenant :exec
UPDATE tenant
SET 
    name = $1,
    phoneNumber = $2
WHERE cognito_id = $3;

-- name: UpdateManager :exec
UPDATE manager
SET 
    name = $1,
    phoneNumber = $2
WHERE cognito_id = $3;
