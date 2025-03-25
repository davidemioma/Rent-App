package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/internal/database"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

func DecodeJSONBody[T any](r *http.Request) (T, error) {
	var params T

	defer r.Body.Close()

	// Decode the JSON body into the struct
	err := json.NewDecoder(r.Body).Decode(&params)

	if err != nil {
		return params, err
	}

	return params, nil
}



func ParsePropertiesQueryParams(r *http.Request) (database.GetFilteredPropertiesParams, error) {
	query := r.URL.Query()

	params := database.GetFilteredPropertiesParams{}

	// Favorite IDs (UUID array)
	if favoriteIds := query.Get("favoriteIds"); favoriteIds != "" {
		ids := strings.Split(favoriteIds, ",")

		uuidList := make([]uuid.UUID, 0, len(ids))

		for _, id := range ids {
			parsedUUID, err := uuid.Parse(id)

			if err != nil {
				return params, fmt.Errorf("invalid favorite ID format: %v", err)
			}

			uuidList = append(uuidList, parsedUUID)
		}

		params.FavoriteIds = uuidList
	}

	// Price range - keep as string
	params.PriceMin = query.Get("priceMin")

    params.PriceMax = query.Get("priceMax")

	// Beds and baths
	if beds := query.Get("beds"); beds != "" && beds != "any" {
        if val, err := strconv.ParseInt(beds, 10, 32); err == nil {
            params.Beds = int32(val)
        }
    }

    if baths := query.Get("baths"); baths != "" && baths != "any" {
        if val, err := strconv.ParseInt(baths, 10, 32); err == nil {
            params.Baths = int32(val)
        }
    }

	// Square footage
	if sqMin := query.Get("squareFeetMin"); sqMin != "" {
        if val, err := strconv.ParseInt(sqMin, 10, 32); err == nil {
            params.SquareFeetMin = int32(val)
        }
    }

    if sqMax := query.Get("squareFeetMax"); sqMax != "" {
        if val, err := strconv.ParseInt(sqMax, 10, 32); err == nil {
            params.SquareFeetMax = int32(val)
        }
    }

	// Property type
	params.PropertyType = query.Get("propertyType")

	// Amenities
	if amenities := query.Get("amenities"); amenities != "" && amenities != "any" {
        params.Amenities = strings.Split(amenities, ",")
    }

	// Available from 
     if availFrom := query.Get("availableFrom"); availFrom != "" && availFrom != "any" {
        if t, err := time.Parse(time.RFC3339, availFrom); err == nil {
            params.AvailableFrom = t
        }
    }

	 // Coordinate
    if lat := query.Get("latitude"); lat != "" {
        if val, err := strconv.ParseFloat(lat, 64); err == nil {
            params.Latitude = val
        }
    }

    if lng := query.Get("longitude"); lng != "" {
        if val, err := strconv.ParseFloat(lng, 64); err == nil {
            params.Longitude = val
        }
    }

	return params, nil
}