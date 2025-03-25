-- name: GetProperty :one
SELECT p.*, l.*
FROM property p
LEFT JOIN location l ON p.location_id = l.id
WHERE p.id = $1;

-- name: GetLocationCoordinates :one
SELECT 
    ST_X(coordinates) AS longitude,  -- float64
    ST_Y(coordinates) AS latitude    -- float64
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
  (CAST(@favorite_ids AS uuid[]) IS NULL OR p.id = ANY(CAST(@favorite_ids AS uuid[])))
  AND (CAST(@price_min AS numeric) IS NULL OR p.price_per_month >= CAST(@price_min AS numeric))
  AND (CAST(@price_max AS numeric) IS NULL OR p.price_per_month <= CAST(@price_max AS numeric))
  AND (CAST(@beds AS int) IS NULL OR @beds = 'any' OR p.beds >= CAST(@beds AS int))
  AND (CAST(@baths AS int) IS NULL OR @baths = 'any' OR p.baths >= CAST(@baths AS int))
  AND (CAST(@square_feet_min AS int) IS NULL OR p.square_feet >= CAST(@square_feet_min AS int))
  AND (CAST(@square_feet_max AS int) IS NULL OR p.square_feet <= CAST(@square_feet_max AS int))
  AND (
    @property_type IS NULL OR 
    @property_type = 'any' OR 
    p.property_type = CAST(@property_type AS property_type)
  )
  AND (array_length(@amenities::text[], 1) IS NULL OR @amenities = '{"any"}' OR p.amenities @> CAST(@amenities AS text[]))
  AND (
    CAST(@available_from AS timestamp) IS NULL OR 
    @available_from = 'any' OR
    EXISTS (
      SELECT 1 FROM lease le 
      WHERE le.property_id = p.id 
      AND le.start_date <= CAST(@available_from AS timestamp)
    )
  )
  AND (
    CAST(@latitude AS float) IS NULL OR 
    CAST(@longitude AS float) IS NULL OR
    ST_DWithin(
      l.coordinates::geometry,
      ST_SetSRID(ST_MakePoint(CAST(@longitude AS float), CAST(@latitude AS float)), 4326),
      1000 / 111.0
    )
  );