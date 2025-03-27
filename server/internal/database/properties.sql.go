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
  p.id, p.name, p.description, p.price_per_month, p.security_deposit, p.application_fee, p.photo_urls, p.is_pets_allowed, p.is_parking_included, p.beds, p.baths, p.square_feet, p.property_type, p.average_rating, p.number_of_reviews, p.location_id, p.manager_id, p.created_at, p.updated_at,
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
  (CAST($1 AS uuid[]) IS NULL OR p.id = ANY(CAST($1 AS uuid[])))
  AND (CAST($2 AS numeric) IS NULL OR p.price_per_month >= CAST($2 AS numeric))
  AND (CAST($3 AS numeric) IS NULL OR p.price_per_month <= CAST($3 AS numeric))
  AND (CAST($4 AS int) IS NULL OR $4 = 'any' OR p.beds >= CAST($4 AS int))
  AND (CAST($5 AS int) IS NULL OR $5 = 'any' OR p.baths >= CAST($5 AS int))
  AND (CAST($6 AS int) IS NULL OR p.square_feet >= CAST($6 AS int))
  AND (CAST($7 AS int) IS NULL OR p.square_feet <= CAST($7 AS int))
  AND (
    $8 IS NULL OR 
    $8 = 'any' OR 
    p.property_type = CAST($8 AS property_type)
  )
  AND (array_length($9::text[], 1) IS NULL OR $9 = '{"any"}' OR p.amenities @> CAST($9 AS text[]))
  AND (
    CAST($10 AS timestamp) IS NULL OR 
    $10 = 'any' OR
    EXISTS (
      SELECT 1 FROM lease le 
      WHERE le.property_id = p.id 
      AND le.start_date <= CAST($10 AS timestamp)
    )
  )
  AND (
    CAST($11 AS float) IS NULL OR 
    CAST($12 AS float) IS NULL OR
    ST_DWithin(
      l.coordinates::geometry,
      ST_SetSRID(ST_MakePoint(CAST($12 AS float), CAST($11 AS float)), 4326),
      1000 / 111.0
    )
  )
`

type GetFilteredPropertiesParams struct {
	FavoriteIds   []uuid.UUID
	PriceMin      string
	PriceMax      string
	Beds          int32
	Baths         int32
	SquareFeetMin int32
	SquareFeetMax int32
	PropertyType  interface{}
	Amenities     []string
	AvailableFrom time.Time
	Latitude      float64
	Longitude     float64
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
		pq.Array(arg.Amenities),
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
    ST_X(coordinates) AS longitude,  -- float64
    ST_Y(coordinates) AS latitude    -- float64
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
SELECT p.id, p.name, p.description, p.price_per_month, p.security_deposit, p.application_fee, p.photo_urls, p.is_pets_allowed, p.is_parking_included, p.beds, p.baths, p.square_feet, p.property_type, p.average_rating, p.number_of_reviews, p.location_id, p.manager_id, p.created_at, p.updated_at, l.id, l.address, l.city, l.state, l.country, l.postal_code, l.coordinates
FROM property p
LEFT JOIN location l ON p.location_id = l.id
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
SELECT p.id, p.name, p.description, p.price_per_month, p.security_deposit, p.application_fee, p.photo_urls, p.is_pets_allowed, p.is_parking_included, p.beds, p.baths, p.square_feet, p.property_type, p.average_rating, p.number_of_reviews, p.location_id, p.manager_id, p.created_at, p.updated_at, l.id, l.address, l.city, l.state, l.country, l.postal_code, l.coordinates
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
  json_build_object(
    'id', l.id,
    'rent', l.rent,
    'deposit', l.deposit,
    'start_date', l.start_date,
    'end_date', l.end_date,
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
  ) AS lease_data
FROM lease l
LEFT JOIN property p ON l.property_id = p.id
LEFT JOIN location loc ON p.location_id = loc.id
WHERE l.tenant_id = $1
`

func (q *Queries) GetTenantProperties(ctx context.Context, tenantID uuid.UUID) ([]json.RawMessage, error) {
	rows, err := q.db.QueryContext(ctx, getTenantProperties, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []json.RawMessage
	for rows.Next() {
		var lease_data json.RawMessage
		if err := rows.Scan(&lease_data); err != nil {
			return nil, err
		}
		items = append(items, lease_data)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
