-- +goose Up
CREATE TYPE property_type AS ENUM ('ROOMS', 'TINYHOUSE', 'APARTMENT', 'VILLA', 'TOWNHOUSE', 'COTTAGE');

CREATE TABLE property (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_per_month NUMERIC NOT NULL,
    security_deposit NUMERIC NOT NULL,
    application_fee NUMERIC NOT NULL,
    photo_urls TEXT[] NOT NULL,
    is_pets_allowed BOOLEAN NOT NULL DEFAULT false,
    is_parking_included BOOLEAN NOT NULL DEFAULT false,
    beds INTEGER NOT NULL,
    baths NUMERIC NOT NULL,
    square_feet INTEGER NOT NULL,
    property_type property_type NOT NULL,
    average_rating NUMERIC DEFAULT 0,
    number_of_reviews INTEGER DEFAULT 0,
    location_id UUID NOT NULL REFERENCES location(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES manager(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenant(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX idx_property_location_id ON property(location_id);
CREATE INDEX idx_property_manager_id ON property(manager_id);
CREATE INDEX idx_property_name ON property(name);

-- +goose Down
DROP INDEX idx_properties_name;
DROP INDEX idx_properties_manager_id;
DROP INDEX idx_properties_location_id;
DROP TABLE property;
DROP TYPE property_type;