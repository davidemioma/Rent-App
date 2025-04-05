-- name: GetProperty :one
SELECT p.*, l.*
FROM property p
LEFT JOIN location l ON p.location_id = l.id
WHERE p.id = $1;

-- name: GetLocationCoordinates :one
SELECT 
    ST_X(coordinates::geometry) AS longitude,
    ST_Y(coordinates::geometry) AS latitude
FROM location 
WHERE id = $1;

-- name: GetFilteredProperties :many
SELECT
  p.*,
  json_build_object(
    'id', l.id,
    'address', l.address,
    'city', l.city,
    'state', l.state,
    'country', l.country,
    'postal_code', l.postal_code,
    'coordinates', json_build_object(
      'longitude', ST_X(l.coordinates::geometry),
      'latitude', ST_Y(l.coordinates::geometry)
    )
  ) as location
FROM property p
JOIN location l ON p.location_id = l.id
WHERE
  -- Favorite IDs: Standard optional array filter
  (sqlc.narg(favorite_ids)::uuid[] IS NULL OR p.id = ANY(sqlc.narg(favorite_ids)::uuid[]))

  -- Price Min: Ignore if NULL or 'any', otherwise compare
  AND (NULLIF(sqlc.narg(price_min)::text, 'any') IS NULL OR p.price_per_month >= CAST(NULLIF(sqlc.narg(price_min)::text, 'any') AS numeric))

  -- Price Max: Ignore if NULL or 'any', otherwise compare
  AND (NULLIF(sqlc.narg(price_max)::text, 'any') IS NULL OR p.price_per_month <= CAST(NULLIF(sqlc.narg(price_max)::text, 'any') AS numeric))

  -- Beds: Ignore if NULL or 'any', otherwise compare
  AND (NULLIF(sqlc.narg(beds)::text, 'any') IS NULL OR p.beds >= CAST(NULLIF(sqlc.narg(beds)::text, 'any') AS int))

  -- Baths: Ignore if NULL or 'any', otherwise compare
  AND (NULLIF(sqlc.narg(baths)::text, 'any') IS NULL OR p.baths >= CAST(NULLIF(sqlc.narg(baths)::text, 'any') AS int))

  -- Square Feet Min: Standard optional integer filter (assuming no 'any')
  AND (sqlc.narg(square_feet_min)::int IS NULL OR p.square_feet >= sqlc.narg(square_feet_min)::int)

   -- Square Feet Max: Standard optional integer filter (assuming no 'any')
  AND (sqlc.narg(square_feet_max)::int IS NULL OR p.square_feet <= sqlc.narg(square_feet_max)::int)

  -- Property Type: Ignore if NULL or 'any', otherwise compare
  AND (NULLIF(sqlc.narg(property_type)::text, 'ANY') IS NULL OR p.property_type = CAST(NULLIF(sqlc.narg(property_type)::text, 'any') AS property_type))

  -- Available From: Ignore if NULL or 'any', otherwise check lease existence
  AND (NULLIF(sqlc.narg(available_from)::text, 'any') IS NULL OR EXISTS (
      SELECT 1 FROM lease le
      WHERE le.property_id = p.id
      AND le.start_date <= CAST(NULLIF(sqlc.narg(available_from)::text, 'any') AS timestamp)
    )
  )
  
  -- Location: User-specified ST_DWithin logic
  AND (
    sqlc.narg(latitude)::float IS NULL OR
    sqlc.narg(longitude)::float IS NULL OR
    ST_DWithin(
      l.coordinates::geometry,
      ST_SetSRID(ST_MakePoint(sqlc.arg(longitude)::float, sqlc.arg(latitude)::float), 4326),
      1000 / 111.0 -- User's specified approximate distance in degrees
    )
);

-- name: CreateLocation :one
INSERT INTO location (id, address, city, state, country, postal_code, coordinates)
VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326))
RETURNING id, address, city, state, country, postal_code, ST_AsText(coordinates) as coordinates;

-- name: CreateProperty :exec
INSERT INTO property (id, name, description, price_per_month, security_deposit, application_fee, photo_urls, is_pets_allowed, is_parking_included, beds, baths, square_feet, property_type, average_rating, number_of_reviews, location_id, manager_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);

-- name: GetManagerProperties :many
SELECT p.*, l.*
FROM property p
JOIN location l ON p.location_id = l.id
WHERE p.manager_id = $1;

-- name: GetTenantProperties :many
SELECT 
  p.id AS property_id,
  p.name AS property_name,
  p.description AS property_description,
  p.price_per_month,
  p.security_deposit,
  p.application_fee,
  p.photo_urls,
  p.is_pets_allowed,
  p.is_parking_included,
  p.beds,
  p.baths,
  p.square_feet,
  p.property_type,
  p.average_rating,
  p.number_of_reviews,
  p.manager_id,
  p.tenant_id,
  p.created_at AS property_created_at,
  p.updated_at AS property_updated_at,
  l.id AS location_id,
  l.address,
  l.city,
  l.state,
  l.country,
  l.postal_code,
  ST_X(l.coordinates::geometry) AS longitude, 
  ST_Y(l.coordinates::geometry) AS latitude
FROM property p
JOIN location l ON p.location_id = l.id 
WHERE p.tenant_id = $1;
    
-- name: UpdateProperty :exec
UPDATE property
SET 
  tenant_id = $1
WHERE id = $2;