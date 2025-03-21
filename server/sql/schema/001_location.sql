-- +goose Up
-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE location (
    id UUID PRIMARY KEY,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    coordinates GEOGRAPHY(Point, 4326)
);

-- +goose Down
DROP TABLE location;
DROP EXTENSION postgis;