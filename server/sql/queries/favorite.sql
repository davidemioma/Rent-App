-- name: AddFavourite :exec
INSERT INTO favorite (id, property_id, tenant_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5);

-- name: RemoveFavourite :exec
DELETE FROM favorite WHERE id = $1 AND property_id = $2 AND tenant_id = $3;

-- name: GetFavourite :one
SELECT * FROM favorite WHERE property_id = $1 AND tenant_id = $2;

-- name: GetFavouriteProperties :many
SELECT 
  json_build_object(
    'id', f.id,
    'propertyId', f.property_id,
    'tenantId', f.tenant_id,
    'property', json_build_object(
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
    )
  ) AS property_data
FROM favorite f
JOIN property p ON f.property_id = p.id
JOIN location loc ON p.location_id = loc.id
WHERE f.tenant_id = $1;