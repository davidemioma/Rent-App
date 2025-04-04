-- name: AddFavourite :exec
INSERT INTO favorite (id, property_id, tenant_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5);

-- name: RemoveFavourite :exec
DELETE FROM favorite WHERE id = $1 AND property_id = $2 AND tenant_id = $3;

-- name: GetFavourite :one
SELECT * FROM favorite WHERE property_id = $1 AND tenant_id = $2;

-- name: GetFavouriteProperties :many
SELECT 
  f.id AS favorite_id,
  f.tenant_id,
  p.id AS property_id,
  p.name AS property_name,
  p.description AS property_description,
  p.price_per_month,
  p.security_deposit,
  p.application_fee,
  p.photo_urls,
  p.is_pets_allowed,
  p.is_parking_included,
  p.manager_id AS property_manager_id,
  p.tenant_id AS property_tenant_id,
  p.beds,
  p.baths,
  p.square_feet,
  p.property_type,
  p.average_rating,
  p.number_of_reviews,
  p.created_at AS property_created_at,
  p.updated_at AS property_updated_at,
  loc.id AS location_id,
  loc.address,
  loc.city,
  loc.state,
  loc.country,
  loc.postal_code,
  ST_X(loc.coordinates::geometry) AS longitude, 
  ST_Y(loc.coordinates::geometry) AS latitude
FROM favorite f
JOIN property p ON f.property_id = p.id
JOIN location loc ON p.location_id = loc.id
WHERE f.tenant_id = $1; 