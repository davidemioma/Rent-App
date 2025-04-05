// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: properties.sql

package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

const createLocation = `-- name: CreateLocation :one
INSERT INTO location (id, address, city, state, country, postal_code, coordinates)
VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326))
RETURNING id, address, city, state, country, postal_code, ST_AsText(coordinates) as coordinates
`

type CreateLocationParams struct {
	ID            uuid.UUID
	Address       string
	City          string
	State         string
	Country       string
	PostalCode    string
	StMakepoint   interface{}
	StMakepoint_2 interface{}
}

type CreateLocationRow struct {
	ID          uuid.UUID
	Address     string
	City        string
	State       string
	Country     string
	PostalCode  string
	Coordinates interface{}
}

func (q *Queries) CreateLocation(ctx context.Context, arg CreateLocationParams) (CreateLocationRow, error) {
	row := q.db.QueryRowContext(ctx, createLocation,
		arg.ID,
		arg.Address,
		arg.City,
		arg.State,
		arg.Country,
		arg.PostalCode,
		arg.StMakepoint,
		arg.StMakepoint_2,
	)
	var i CreateLocationRow
	err := row.Scan(
		&i.ID,
		&i.Address,
		&i.City,
		&i.State,
		&i.Country,
		&i.PostalCode,
		&i.Coordinates,
	)
	return i, err
}

const createProperty = `-- name: CreateProperty :exec
INSERT INTO property (id, name, description, price_per_month, security_deposit, application_fee, photo_urls, is_pets_allowed, is_parking_included, beds, baths, square_feet, property_type, average_rating, number_of_reviews, location_id, manager_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
`

type CreatePropertyParams struct {
	ID                uuid.UUID
	Name              string
	Description       string
	PricePerMonth     string
	SecurityDeposit   string
	ApplicationFee    string
	PhotoUrls         []string
	IsPetsAllowed     bool
	IsParkingIncluded bool
	Beds              int32
	Baths             string
	SquareFeet        int32
	PropertyType      PropertyType
	AverageRating     sql.NullString
	NumberOfReviews   sql.NullInt32
	LocationID        uuid.UUID
	ManagerID         uuid.UUID
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

func (q *Queries) CreateProperty(ctx context.Context, arg CreatePropertyParams) error {
	_, err := q.db.ExecContext(ctx, createProperty,
		arg.ID,
		arg.Name,
		arg.Description,
		arg.PricePerMonth,
		arg.SecurityDeposit,
		arg.ApplicationFee,
		pq.Array(arg.PhotoUrls),
		arg.IsPetsAllowed,
		arg.IsParkingIncluded,
		arg.Beds,
		arg.Baths,
		arg.SquareFeet,
		arg.PropertyType,
		arg.AverageRating,
		arg.NumberOfReviews,
		arg.LocationID,
		arg.ManagerID,
		arg.CreatedAt,
		arg.UpdatedAt,
	)
	return err
}

const getFilteredProperties = `-- name: GetFilteredProperties :many
SELECT
  p.id, p.name, p.description, p.price_per_month, p.security_deposit, p.application_fee, p.photo_urls, p.is_pets_allowed, p.is_parking_included, p.beds, p.baths, p.square_feet, p.property_type, p.average_rating, p.number_of_reviews, p.location_id, p.manager_id, p.tenant_id, p.created_at, p.updated_at,
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
  ($1::uuid[] IS NULL OR p.id = ANY($1::uuid[]))

  -- Price Min: Ignore if NULL or 'any', otherwise compare
  AND (NULLIF($2::text, 'any') IS NULL OR p.price_per_month >= CAST(NULLIF($2::text, 'any') AS numeric))

  -- Price Max: Ignore if NULL or 'any', otherwise compare
  AND (NULLIF($3::text, 'any') IS NULL OR p.price_per_month <= CAST(NULLIF($3::text, 'any') AS numeric))

  -- Beds: Ignore if NULL or 'any', otherwise compare
  AND (NULLIF($4::text, 'any') IS NULL OR p.beds >= CAST(NULLIF($4::text, 'any') AS int))

  -- Baths: Ignore if NULL or 'any', otherwise compare
  AND (NULLIF($5::text, 'any') IS NULL OR p.baths >= CAST(NULLIF($5::text, 'any') AS int))

  -- Square Feet Min: Standard optional integer filter (assuming no 'any')
  AND ($6::int IS NULL OR p.square_feet >= $6::int)

   -- Square Feet Max: Standard optional integer filter (assuming no 'any')
  AND ($7::int IS NULL OR p.square_feet <= $7::int)

  -- Property Type: Ignore if NULL or 'any', otherwise compare
  AND (NULLIF($8::text, 'ANY') IS NULL OR p.property_type = CAST(NULLIF($8::text, 'any') AS property_type))

  -- Available From: Ignore if NULL or 'any', otherwise check lease existence
  AND (NULLIF($9::text, 'any') IS NULL OR EXISTS (
      SELECT 1 FROM lease le
      WHERE le.property_id = p.id
      AND le.start_date <= CAST(NULLIF($9::text, 'any') AS timestamp)
    )
  )
  
  -- Location: User-specified ST_DWithin logic
  AND (
    $10::float IS NULL OR
    $11::float IS NULL OR
    ST_DWithin(
      l.coordinates::geometry,
      ST_SetSRID(ST_MakePoint($11::float, $10::float), 4326),
      1000 / 111.0 -- User's specified approximate distance in degrees
    )
)
`

type GetFilteredPropertiesParams struct {
	FavoriteIds   []uuid.UUID
	PriceMin      sql.NullString
	PriceMax      sql.NullString
	Beds          sql.NullString
	Baths         sql.NullString
	SquareFeetMin sql.NullInt32
	SquareFeetMax sql.NullInt32
	PropertyType  sql.NullString
	AvailableFrom sql.NullString
	Latitude      sql.NullFloat64
	Longitude     sql.NullFloat64
}

type GetFilteredPropertiesRow struct {
	ID                uuid.UUID
	Name              string
	Description       string
	PricePerMonth     string
	SecurityDeposit   string
	ApplicationFee    string
	PhotoUrls         []string
	IsPetsAllowed     bool
	IsParkingIncluded bool
	Beds              int32
	Baths             string
	SquareFeet        int32
	PropertyType      PropertyType
	AverageRating     sql.NullString
	NumberOfReviews   sql.NullInt32
	LocationID        uuid.UUID
	ManagerID         uuid.UUID
	TenantID          uuid.NullUUID
	CreatedAt         time.Time
	UpdatedAt         time.Time
	Location          json.RawMessage
}

func (q *Queries) GetFilteredProperties(ctx context.Context, arg GetFilteredPropertiesParams) ([]GetFilteredPropertiesRow, error) {
	rows, err := q.db.QueryContext(ctx, getFilteredProperties,
		pq.Array(arg.FavoriteIds),
		arg.PriceMin,
		arg.PriceMax,
		arg.Beds,
		arg.Baths,
		arg.SquareFeetMin,
		arg.SquareFeetMax,
		arg.PropertyType,
		arg.AvailableFrom,
		arg.Latitude,
		arg.Longitude,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetFilteredPropertiesRow
	for rows.Next() {
		var i GetFilteredPropertiesRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.PricePerMonth,
			&i.SecurityDeposit,
			&i.ApplicationFee,
			pq.Array(&i.PhotoUrls),
			&i.IsPetsAllowed,
			&i.IsParkingIncluded,
			&i.Beds,
			&i.Baths,
			&i.SquareFeet,
			&i.PropertyType,
			&i.AverageRating,
			&i.NumberOfReviews,
			&i.LocationID,
			&i.ManagerID,
			&i.TenantID,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.Location,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getLocationCoordinates = `-- name: GetLocationCoordinates :one
SELECT 
    ST_X(coordinates::geometry) AS longitude,
    ST_Y(coordinates::geometry) AS latitude
FROM location 
WHERE id = $1
`

type GetLocationCoordinatesRow struct {
	Longitude interface{}
	Latitude  interface{}
}

func (q *Queries) GetLocationCoordinates(ctx context.Context, id uuid.UUID) (GetLocationCoordinatesRow, error) {
	row := q.db.QueryRowContext(ctx, getLocationCoordinates, id)
	var i GetLocationCoordinatesRow
	err := row.Scan(&i.Longitude, &i.Latitude)
	return i, err
}

const getManagerProperties = `-- name: GetManagerProperties :many
SELECT p.id, p.name, p.description, p.price_per_month, p.security_deposit, p.application_fee, p.photo_urls, p.is_pets_allowed, p.is_parking_included, p.beds, p.baths, p.square_feet, p.property_type, p.average_rating, p.number_of_reviews, p.location_id, p.manager_id, p.tenant_id, p.created_at, p.updated_at, l.id, l.address, l.city, l.state, l.country, l.postal_code, l.coordinates
FROM property p
JOIN location l ON p.location_id = l.id
WHERE p.manager_id = $1
`

type GetManagerPropertiesRow struct {
	ID                uuid.UUID
	Name              string
	Description       string
	PricePerMonth     string
	SecurityDeposit   string
	ApplicationFee    string
	PhotoUrls         []string
	IsPetsAllowed     bool
	IsParkingIncluded bool
	Beds              int32
	Baths             string
	SquareFeet        int32
	PropertyType      PropertyType
	AverageRating     sql.NullString
	NumberOfReviews   sql.NullInt32
	LocationID        uuid.UUID
	ManagerID         uuid.UUID
	TenantID          uuid.NullUUID
	CreatedAt         time.Time
	UpdatedAt         time.Time
	ID_2              uuid.UUID
	Address           string
	City              string
	State             string
	Country           string
	PostalCode        string
	Coordinates       interface{}
}

func (q *Queries) GetManagerProperties(ctx context.Context, managerID uuid.UUID) ([]GetManagerPropertiesRow, error) {
	rows, err := q.db.QueryContext(ctx, getManagerProperties, managerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetManagerPropertiesRow
	for rows.Next() {
		var i GetManagerPropertiesRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.PricePerMonth,
			&i.SecurityDeposit,
			&i.ApplicationFee,
			pq.Array(&i.PhotoUrls),
			&i.IsPetsAllowed,
			&i.IsParkingIncluded,
			&i.Beds,
			&i.Baths,
			&i.SquareFeet,
			&i.PropertyType,
			&i.AverageRating,
			&i.NumberOfReviews,
			&i.LocationID,
			&i.ManagerID,
			&i.TenantID,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.ID_2,
			&i.Address,
			&i.City,
			&i.State,
			&i.Country,
			&i.PostalCode,
			&i.Coordinates,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getProperty = `-- name: GetProperty :one
SELECT p.id, p.name, p.description, p.price_per_month, p.security_deposit, p.application_fee, p.photo_urls, p.is_pets_allowed, p.is_parking_included, p.beds, p.baths, p.square_feet, p.property_type, p.average_rating, p.number_of_reviews, p.location_id, p.manager_id, p.tenant_id, p.created_at, p.updated_at, l.id, l.address, l.city, l.state, l.country, l.postal_code, l.coordinates
FROM property p
LEFT JOIN location l ON p.location_id = l.id
WHERE p.id = $1
`

type GetPropertyRow struct {
	ID                uuid.UUID
	Name              string
	Description       string
	PricePerMonth     string
	SecurityDeposit   string
	ApplicationFee    string
	PhotoUrls         []string
	IsPetsAllowed     bool
	IsParkingIncluded bool
	Beds              int32
	Baths             string
	SquareFeet        int32
	PropertyType      PropertyType
	AverageRating     sql.NullString
	NumberOfReviews   sql.NullInt32
	LocationID        uuid.UUID
	ManagerID         uuid.UUID
	TenantID          uuid.NullUUID
	CreatedAt         time.Time
	UpdatedAt         time.Time
	ID_2              uuid.NullUUID
	Address           sql.NullString
	City              sql.NullString
	State             sql.NullString
	Country           sql.NullString
	PostalCode        sql.NullString
	Coordinates       interface{}
}

func (q *Queries) GetProperty(ctx context.Context, id uuid.UUID) (GetPropertyRow, error) {
	row := q.db.QueryRowContext(ctx, getProperty, id)
	var i GetPropertyRow
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.PricePerMonth,
		&i.SecurityDeposit,
		&i.ApplicationFee,
		pq.Array(&i.PhotoUrls),
		&i.IsPetsAllowed,
		&i.IsParkingIncluded,
		&i.Beds,
		&i.Baths,
		&i.SquareFeet,
		&i.PropertyType,
		&i.AverageRating,
		&i.NumberOfReviews,
		&i.LocationID,
		&i.ManagerID,
		&i.TenantID,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.ID_2,
		&i.Address,
		&i.City,
		&i.State,
		&i.Country,
		&i.PostalCode,
		&i.Coordinates,
	)
	return i, err
}

const getTenantProperties = `-- name: GetTenantProperties :many
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
WHERE p.tenant_id = $1
`

type GetTenantPropertiesRow struct {
	PropertyID          uuid.UUID
	PropertyName        string
	PropertyDescription string
	PricePerMonth       string
	SecurityDeposit     string
	ApplicationFee      string
	PhotoUrls           []string
	IsPetsAllowed       bool
	IsParkingIncluded   bool
	Beds                int32
	Baths               string
	SquareFeet          int32
	PropertyType        PropertyType
	AverageRating       sql.NullString
	NumberOfReviews     sql.NullInt32
	ManagerID           uuid.UUID
	TenantID            uuid.NullUUID
	PropertyCreatedAt   time.Time
	PropertyUpdatedAt   time.Time
	LocationID          uuid.UUID
	Address             string
	City                string
	State               string
	Country             string
	PostalCode          string
	Longitude           interface{}
	Latitude            interface{}
}

func (q *Queries) GetTenantProperties(ctx context.Context, tenantID uuid.NullUUID) ([]GetTenantPropertiesRow, error) {
	rows, err := q.db.QueryContext(ctx, getTenantProperties, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetTenantPropertiesRow
	for rows.Next() {
		var i GetTenantPropertiesRow
		if err := rows.Scan(
			&i.PropertyID,
			&i.PropertyName,
			&i.PropertyDescription,
			&i.PricePerMonth,
			&i.SecurityDeposit,
			&i.ApplicationFee,
			pq.Array(&i.PhotoUrls),
			&i.IsPetsAllowed,
			&i.IsParkingIncluded,
			&i.Beds,
			&i.Baths,
			&i.SquareFeet,
			&i.PropertyType,
			&i.AverageRating,
			&i.NumberOfReviews,
			&i.ManagerID,
			&i.TenantID,
			&i.PropertyCreatedAt,
			&i.PropertyUpdatedAt,
			&i.LocationID,
			&i.Address,
			&i.City,
			&i.State,
			&i.Country,
			&i.PostalCode,
			&i.Longitude,
			&i.Latitude,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateProperty = `-- name: UpdateProperty :exec
UPDATE property
SET 
  tenant_id = $1
WHERE id = $2
`

type UpdatePropertyParams struct {
	TenantID uuid.NullUUID
	ID       uuid.UUID
}

func (q *Queries) UpdateProperty(ctx context.Context, arg UpdatePropertyParams) error {
	_, err := q.db.ExecContext(ctx, updateProperty, arg.TenantID, arg.ID)
	return err
}
