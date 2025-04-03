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
-- SELECT 
--   p.*,
--   json_build_object(
--     'id', l.id,
--     'address', l.address,
--     'city', l.city,
--     'state', l.state,
--     'country', l.country,
--     'postal_code', l.postal_code,
--     'coordinates', json_build_object(
--       'longitude', ST_X(l.coordinates::geometry),
--       'latitude', ST_Y(l.coordinates::geometry)
--     )
--   ) as location
-- FROM property p
-- JOIN location l ON p.location_id = l.id
-- WHERE 
--   (CAST(@favorite_ids AS uuid[]) IS NULL OR p.id = ANY(CAST(@favorite_ids AS uuid[])))
--   AND (CAST(@price_min AS numeric) IS NULL OR @price_min = 'any' OR p.price_per_month >= CAST(@price_min AS numeric))
--   AND (CAST(@price_max AS numeric) IS NULL OR @price_min = 'any' OR p.price_per_month <= CAST(@price_max AS numeric))
--   AND (CAST(@beds AS int) IS NULL OR @beds = 'any' OR p.beds >= CAST(@beds AS int))
--   AND (CAST(@baths AS int) IS NULL OR @baths = 'any' OR p.baths >= CAST(@baths AS int))1
--   AND (CAST(@square_feet_min AS int) IS NULL OR p.square_feet >= CAST(@square_feet_min AS int))
--   AND (CAST(@square_feet_max AS int) IS NULL OR p.square_feet <= CAST(@square_feet_max AS int))
--   AND (
--     @property_type IS NULL OR 
--     @property_type = 'any' OR 
--     p.property_type = CAST(@property_type AS property_type)
--   )
--   AND (array_length(@amenities::text[], 1) IS NULL OR @amenities = '{"any"}' OR p.amenities @> CAST(@amenities AS text[]))
--   AND (
--     CAST(@available_from AS timestamp) IS NULL OR 
--     @available_from = 'any' OR
--     EXISTS (
--       SELECT 1 FROM lease le 
--       WHERE le.property_id = p.id 
--       AND le.start_date <= CAST(@available_from AS timestamp)
--     )
--   )
--   AND (
--     CAST(@latitude AS float) IS NULL OR 
--     CAST(@longitude AS float) IS NULL OR
--     ST_DWithin(
--       l.coordinates::geometry,
--       ST_SetSRID(ST_MakePoint(CAST(@longitude AS float), CAST(@latitude AS float)), 4326),
--       1000 / 111.0
--     )
--   );

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
  json_build_object(
    'id', p.id,
    'name', p.name,
    'description', p.description,
    'price_per_month', p.price_per_month,
    'security_deposit', p.security_deposit,
    'application_fee', p.application_fee,
    'photo_urls', p.photo_urls,
    'is_pets_allowed', p.is_pets_allowed,
    'is_parking_included', p.is_parking_included,
    'beds', p.beds,
    'baths', p.baths,
    'square_feet', p.square_feet,
    'property_type', p.property_type,
    'average_rating', p.average_rating,
    'number_of_reviews', p.number_of_reviews,
    'manager_id', p.manager_id,
    'tenant_id', p.tenant_id,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'location', json_build_object(
      'id', loc.id,
      'address', loc.address,
      'city', loc.city,
      'state', loc.state,
      'country', loc.country,
      'postal_code', loc.postal_code,
      'coordinates', json_build_object(
        'longitude', ST_X(loc.coordinates::geometry),
        'latitude', ST_Y(loc.coordinates::geometry)
      )
    )
  ) AS property_data
FROM property p
LEFT JOIN location l ON p.location_id = l.id
WHERE p.tenant_id = $1;

-- name: UpdateProperty :exec
UPDATE property
SET 
  tenant_id = $1
WHERE id = $2;