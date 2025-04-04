package main

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"server/cmd/utils"
	"server/internal/database"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) getProperty(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// check if ID is valid
	validId, err := uuid.Parse(id)

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid property ID format")
        
        return
	}

	property, err := app.dbQuery.GetProperty(r.Context(), validId)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, utils.JsonProperty{})

			return
		}

		log.Printf("getProperty DB err: %v", err)
		
		utils.RespondWithError(w, http.StatusNotFound, "Unable to get property. Try again")

		return
	}

	// Get location co-ordinates
	coords, err := app.dbQuery.GetLocationCoordinates(r.Context(), property.LocationID)

	if err != nil {
		log.Printf("getProperty (GetLocationCoordinates) err: %v", err)
		
		utils.RespondWithError(w, http.StatusNotFound, "Unable to get property coordinates. Try again")

		return
	}

	lng := coords.Longitude.(float64)

	lat := coords.Latitude.(float64)

	utils.RespondWithJSON(w, http.StatusOK, utils.DBpropertyToJson(property, lat, lng))
}

func (app *application) getProperties(w http.ResponseWriter, r *http.Request) {
	// Retrieve query parameters
    params, err := utils.ParsePropertiesQueryParams(r)

	if err != nil {
		log.Printf("Error parsing URL query params in getProperties: %v", err)
		
		utils.RespondWithError(w, http.StatusBadRequest, "Error parsing URL query params")

		return
	}

	// Get properties
	properties, err := app.dbQuery.GetFilteredProperties(r.Context(), params)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, []utils.JsonFilteredProperties{})

			return
		}

		log.Printf("getProperties DB err: %v", err)
		
		utils.RespondWithError(w, http.StatusNotFound, "Unable to get properties. Try again")

		return
	}

	utils.RespondWithJSON(w, http.StatusOK, utils.DBFilteredPropertiesToJson(properties))
}

func (app *application) createProperty(w http.ResponseWriter, r *http.Request, user utils.User) {
	// Check if user is a manager
	manager, err := app.dbQuery.GetManagerByCognitoId(r.Context(), user.CognitoID)

	if err != nil {
		log.Printf("GetManagerByCognitoId DB err: %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Account not found! Unathorized.")
      
        return
	}

	// Get the values and files from the form
	data, err := utils.GetCreatePropertyFormValues(r)

	if err != nil {
		log.Printf("Unable to parse form (createProperty): %v", err)

		utils.RespondWithError(w, http.StatusBadRequest, "Unable to parse form")
      
        return

	}

	// Upload images to AWS
	var imageUrls []string

	log.Println(data.PropertyData.UploadedFiles)

	if (len(data.PropertyData.UploadedFiles) > 0) {
		for _, uf := range data.PropertyData.UploadedFiles {
			// Generate a unique key for the S3 object
		    uniqueID := uuid.New().String()

			key := "uploads/" + uniqueID + uf.Extension

			// Upload to S3 and create a URL with cloudfront
			s3Err := utils.UploadToS3(app.s3Bucket, key, uf.File)

			if s3Err != nil {
				log.Printf("Could not upload to s3 (UploadToS3): %v", s3Err)

				utils.RespondWithError(w, http.StatusInternalServerError, "Could not upload to s3. Try Again")

				return
		    }

			url := app.cloudfront_url + "/" + key + "#t=1"

			imageUrls = append(imageUrls, url)
		}
	}

	// Create Location
	longitude, latitude, err := utils.GetCoordinates("1", data.Address, data.City, data.Country, data.PostalCode)

	if err != nil {
		log.Printf("Unable to get co-ordinates (GetCoordinates): %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Unable to get co-ordinates")
      
        return
	}

	location, err := app.dbQuery.CreateLocation(r.Context(), database.CreateLocationParams{
		ID: uuid.New(),
		Address: data.Address,
		City: data.City,
		State: data.State,
		Country: data.Country,
		PostalCode: data.PostalCode,
		StMakepoint: longitude,
		StMakepoint_2: latitude,
	})

	if err != nil {
		log.Printf("CreateLocation DB err: %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Unable to get co-ordinates")
      
        return
	}

	// Create property
	dbErr := app.dbQuery.CreateProperty(r.Context(), database.CreatePropertyParams{
		ID: uuid.New(),
		Name: data.PropertyData.Name,
		Description: data.PropertyData.Description,
		PricePerMonth: fmt.Sprintf("%.2f", data.PropertyData.PricePerMonth),
		SecurityDeposit: fmt.Sprintf("%.2f", data.PropertyData.SecurityDeposit),
		ApplicationFee: fmt.Sprintf("%.2f", data.PropertyData.ApplicationFee),
		PhotoUrls: imageUrls,
		IsPetsAllowed: data.PropertyData.IsPetsAllowed,
		IsParkingIncluded: data.PropertyData.IsParkingIncluded,
		Beds: int32(data.PropertyData.Beds),
		Baths: fmt.Sprintf("%.2f", data.PropertyData.Baths),
		SquareFeet: int32(data.PropertyData.SquareFeet),
		PropertyType : database.PropertyType(data.PropertyData.PropertyType),
		AverageRating: sql.NullString{
			String: fmt.Sprintf("%.2f", data.PropertyData.AverageRating),
			Valid:  true,
		},
		NumberOfReviews: sql.NullInt32{
			Int32: int32(data.PropertyData.NumberOfReviews),
			Valid: data.PropertyData.NumberOfReviews > 0,
		},
		LocationID: location.ID,
		ManagerID: manager.ID,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	})

	if dbErr != nil {
		log.Printf("CreateProperty DB err: %v", dbErr)

		utils.RespondWithError(w, http.StatusBadRequest, "Unable to create property! Try again.")
      
        return
	}

	utils.RespondWithJSON(w, http.StatusCreated, "Property Created")
}

func (app *application) getManagerProperties(w http.ResponseWriter, r *http.Request, user utils.User) {
	manager, err := app.dbQuery.GetManagerByCognitoId(r.Context(), user.CognitoID)

	if err != nil {
		log.Printf("GetManagerByCognitoId DB err: %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Account not found!")
      
        return
	}

	// Get properties
	var propertiesWithLocation []utils.JsonProperty

	properties, err := app.dbQuery.GetManagerProperties(r.Context(), manager.ID)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, []utils.JsonProperty{})

			return
		} else {
			log.Printf("GetManagerProperties DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Unable to get properties!")
		
			return
		}
	}

	for _, property := range properties {
		coords, err := app.dbQuery.GetLocationCoordinates(r.Context(), property.LocationID)

		if err != nil {
			log.Printf("getManagerProperties (GetLocationCoordinates) err: %v", err)
			
			utils.RespondWithError(w, http.StatusNotFound, "Unable to get property coordinates. Try again")

			return
		}

		lng := coords.Longitude.(float64)

		lat := coords.Latitude.(float64)

		propertiesWithLocation = append(propertiesWithLocation, utils.DBManagerPropertyToJson(property, lat, lng))
	}

	utils.RespondWithJSON(w, http.StatusOK, propertiesWithLocation)
}

func (app *application) getCurrentResidences(w http.ResponseWriter, r *http.Request, user utils.User) {
	tenant, err := app.dbQuery.GetTenantByCognitoId(r.Context(), user.CognitoID)

	if err != nil {
		log.Printf("GetTenantByCognitoId DB err: %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Account not found!")
      
        return
	}

	// Get properties
	var propertiesWithLocation []utils.JsonProperty

	properties, err := app.dbQuery.GetTenantProperties(r.Context(), uuid.NullUUID{
		UUID: tenant.ID,
		Valid: tenant.ID != uuid.Nil,
	})

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, []utils.JsonProperty{})

			return
		} else {
			log.Printf("GetManagerProperties DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Unable to get properties!")
		
			return
		}
	}

	if (len(properties) < 1) {
		utils.RespondWithJSON(w, http.StatusOK, []utils.JsonProperty{})

		return
	}

	for _, property := range properties {
		coords, err := app.dbQuery.GetLocationCoordinates(r.Context(), property.LocationID)

		if err != nil {
			log.Printf("getCurrentResidences (GetLocationCoordinates) err: %v", err)
			
			utils.RespondWithError(w, http.StatusNotFound, "Unable to get property coordinates. Try again")

			return
		}

		lng := coords.Longitude.(float64)

		lat := coords.Latitude.(float64)

		propertiesWithLocation = append(propertiesWithLocation, utils.JsonProperty{
			ID: property.PropertyID,
			Name: property.PropertyName,
			Description:       property.PropertyDescription,
			PricePerMonth:     property.PricePerMonth,
			SecurityDeposit:   property.SecurityDeposit,
			ApplicationFee:    property.ApplicationFee,
			PhotoUrls:         property.PhotoUrls,
			IsPetsAllowed:     property.IsPetsAllowed,
			IsParkingIncluded: property.IsParkingIncluded,
			Beds:              property.Beds,
			Baths:             property.Baths,
			SquareFeet:        property.SquareFeet,
			PropertyType:      string(property.PropertyType),
			AverageRating:     property.AverageRating,
			NumberOfReviews:   property.NumberOfReviews,
			LocationID:        property.LocationID,
			ManagerID:         property.ManagerID,
			TenantID:          uuid.NullUUID{
				UUID: property.TenantID.UUID,
				Valid: property.TenantID.UUID != uuid.Nil,
			},
			CreatedAt:         property.PropertyCreatedAt,
			UpdatedAt:         property.PropertyUpdatedAt,
			Location:          utils.JsonLocation{
				ID: property.LocationID,
				Address: property.Address,
				City: property.City,
				State: property.State,
				Country: property.Country,
				PostalCode: property.PostalCode,
				Coordinates: utils.Coordinates{
					Latitude: lat,
					Longitude: lng,
				},
			},
		})
	}

	utils.RespondWithJSON(w, http.StatusOK, propertiesWithLocation)
}