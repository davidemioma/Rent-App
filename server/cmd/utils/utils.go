package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
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

func strToFloat(s string) float64 {
	f, _ := strconv.ParseFloat(s, 64)
	return f
}

func strToInt(s string) int {
	i, _ := strconv.Atoi(s)
	return i
}

func strToBool(s string) bool {
	return s == "true" || s == "on" || s == "1"
}

func getFileExtension(contentType string) string {
    switch contentType {
		case "image/jpeg":
			return ".jpeg"
		case "image/jpg":
			return ".jpg"	
		case "image/png":
			return ".png"
		case "image/svg":
			return ".svg"
		case "image/webp":
			return ".webp"
		default:
			return ""
		}
}

func processUploadedFiles(r *http.Request) ([]UploadedFile, error) {
	var uploadedFiles []UploadedFile

	// Check if files were uploaded
	fileHeaders := r.MultipartForm.File["images"]

	if len(fileHeaders) == 0 {
		return nil, nil
	}

	for _, fileHeader := range fileHeaders {
		file, err := fileHeader.Open()

		if err != nil {
			// Close any already opened files before returning error
			for _, uf := range uploadedFiles {
				uf.File.Close()
			}
			return nil, fmt.Errorf("failed to open file %s: %w", fileHeader.Filename, err)
		}

		contentType := fileHeader.Header.Get("Content-Type")

		ext := getFileExtension(contentType)

		uploadedFiles = append(uploadedFiles, UploadedFile{
			File:        file,
			Header:      fileHeader,
			ContentType: contentType,
			Extension:   ext,
		})
	}

	return uploadedFiles, nil
}

func GetCreatePropertyFormValues(r *http.Request) (PropertyFormData, error) {
	// Parse the multipart form (form data that contains files)
    err := r.ParseMultipartForm(32 << 20) // max 32Mb

	if err != nil {
		log.Printf("Unable to parse form (GetCreatePropertyFormValues): %v", err)
      
        return PropertyFormData{}, err
    }

	// Handle multiple file uploads
	uploadedFiles, err := processUploadedFiles(r)

	if err != nil {
		log.Printf("failed to process uploaded files (processUploadedFiles): %v", err)
      
        return PropertyFormData{}, err
    }

	// return values and files from the form
	data := PropertyFormData{
		Address: r.FormValue("address"),
		City: r.FormValue("city"),
		State: r.FormValue("state"),
		Country: r.FormValue("country"),
		PostalCode: r.FormValue("postalCode"),
		PropertyData: PropertyData{
			Name:               r.FormValue("name"),
			Description:        r.FormValue("description"),
			PricePerMonth:      strToFloat(r.FormValue("price_per_month")),
			SecurityDeposit:    strToFloat(r.FormValue("security_deposit")),
			ApplicationFee:     strToFloat(r.FormValue("application_fee")),
			IsPetsAllowed:      strToBool(r.FormValue("is_pets_allowed")),
			IsParkingIncluded:  strToBool(r.FormValue("is_parking_included")),
			Beds:               strToInt(r.FormValue("beds")),
			Baths:              strToFloat(r.FormValue("baths")),
			SquareFeet:         strToInt(r.FormValue("square_feet")),
			PropertyType:       r.FormValue("property_type"),
			AverageRating:      strToFloat(r.FormValue("average_rating")),
	        NumberOfReviews:    strToInt(r.FormValue("number_of_reviews")),
			UploadedFiles:      uploadedFiles,
		},
	}

	return data, nil
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

type GeocodingResult struct {
	Lon string `json:"lon"`
	Lat string `json:"lat"`
}

func GetCoordinates(limit, address, city, country, postalCode string) (float64, float64, error) {
	// Build URL with query parameters
	params := url.Values{}
	params.Add("street", address)
	params.Add("city", city)
	params.Add("country", country)
	params.Add("postalcode", postalCode)
	params.Add("format", "json")
	params.Add("limit", limit)
	
	geocodingUrl := "https://nominatim.openstreetmap.org/search?" + params.Encode()

	// Create request with User-Agent header
	req, err := http.NewRequest(http.MethodGet, geocodingUrl, nil)

	if err != nil {
		return 0, 0, fmt.Errorf("failed to create request (GetCoordinates - NewRequest): %w", err)
	}

	req.Header.Set("User-Agent", "RentalApp (justsomedummyemail@gmail.com)")

	// Make the HTTP request
	client := &http.Client{}

	resp, err := client.Do(req)

	if err != nil {
		return 0, 0, fmt.Errorf("failed to make request (GetCoordinates - client.Do): %w", err)
	}

	defer resp.Body.Close()

	// Read and parse the response
	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return 0, 0, fmt.Errorf("failed to read response (GetCoordinates - io.ReadAll): %w", err)
	}

	var results []GeocodingResult

	if err := json.Unmarshal(body, &results); err != nil {
		return 0, 0, fmt.Errorf("failed to parse JSON (GetCoordinates - json.Unmarshal): %w", err)
	}

	// Handle empty response
	if len(results) == 0 {
		return 0, 0, nil
	}

	// Parse coordinates
	longitude, err := strconv.ParseFloat(results[0].Lon, 64)

	if err != nil {
		return 0, 0, fmt.Errorf("failed to parse longitude: %w", err)
	}

	latitude, err := strconv.ParseFloat(results[0].Lat, 64)
	
	if err != nil {
		return 0, 0, fmt.Errorf("failed to parse latitude: %w", err)
	}

	return longitude, latitude, nil
}