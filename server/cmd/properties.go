package main

import (
	"log"
	"net/http"
	"server/cmd/utils"

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
		log.Printf("getProperties DB err: %v", err)
		
		utils.RespondWithError(w, http.StatusBadRequest, "Unable to get properties. Try again")

		return
	}

	utils.RespondWithJSON(w, http.StatusOK, utils.DBFilteredPropertiesToJson(properties))
}

func (app *application) createProperty(w http.ResponseWriter, r *http.Request, user utils.User) {}