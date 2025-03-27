-- name: GetUserApplications :many
SELECT 
    a.id AS application_id,
    a.lease_id AS lease_id,
    a.name AS application_name,
    a.email AS application_email,
    a.phone_number AS application_phone_number,
    a.message AS application_message,
    a.status AS application_status,
    a.application_date AS application_application_date,
    p.*,
    l.id AS property_location_id, 
    l.address AS location_address,
    l.city AS location_city,
    l.state AS location_state,
    l.country AS location_country,
    l.postal_code AS location_postal_code,
    m.id AS manager_user_id,
    m.cognito_id AS manager_cognito_id,
    m.name AS manager_name,
    m.email AS manager_email,
    m.phoneNumber AS manager_phoneNumber,
    t.id AS tenant_user_id,
    t.cognito_id AS tenant_cognito_id,
    t.name AS tenant_name,
    t.email AS tenant_email,
    t.phoneNumber AS tenant_phoneNumber
FROM application a
JOIN property p ON a.property_id = p.id
JOIN location l ON p.location_id = l.id
JOIN manager m ON p.manager_id = m.id
JOIN tenant t ON a.tenant_id = t.id
WHERE 
    (CAST($1 AS text) = 'manager' AND p.manager_id = $2)
    OR
    (CAST($1 AS text) = 'tenant' AND a.tenant_id = $2);