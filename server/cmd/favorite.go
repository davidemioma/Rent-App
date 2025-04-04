package main

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"server/cmd/utils"
	"server/internal/database"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) getFavoriteProperties(w http.ResponseWriter, r *http.Request, user utils.User) {
	var favoriteProperties []utils.FavoriteProperty

	tenant, err := app.dbQuery.GetTenantByCognitoId(r.Context(), user.CognitoID)

	if err != nil {
		log.Printf("getFavoriteProperties DB err: %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Account not found!")
      
        return
	}

	properties, err := app.dbQuery.GetFavouriteProperties(r.Context(), tenant.ID)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, []utils.FavoriteProperty{})

			return
		} else {
			log.Printf("GetFavouriteProperties DB err: %v", err)

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

		favoriteProperties = append(favoriteProperties, utils.DBfavouriteToJson(property, lat, lng))
	}

	utils.RespondWithJSON(w, http.StatusOK, favoriteProperties)
}

func (app *application) checkFavorite(w http.ResponseWriter, r *http.Request, user utils.User) {
	type ReturnType struct {
		IsFavorite bool `json:"isFavorite"`
	}

	propertyId := chi.URLParam(r, "propertyId")

	if propertyId == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Property ID is required")

		return
	}

	// Validate property ID
	validPropertyId, err := uuid.Parse(propertyId)

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid property ID")

		return
	}

	// Check if user is a tenant
	tenant, err := app.dbQuery.GetTenantByCognitoId(r.Context(), user.CognitoID)

	if err != nil {
		log.Printf("checkFavorite (GetTenantByCognitoId) DB err: %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Account not found!")
      
        return
	}

	// Check if favorite exists
	favorite, err := app.dbQuery.GetFavourite(r.Context(), database.GetFavouriteParams{
		PropertyID: validPropertyId,
		TenantID: tenant.ID,
	})

	if (err == nil && favorite.ID != uuid.Nil) {
		utils.RespondWithJSON(w, http.StatusOK, ReturnType{
			IsFavorite: true,
		})

		return
	}

	utils.RespondWithJSON(w, http.StatusOK, ReturnType{
		IsFavorite: false,
	})
}

func (app *application) toggleFavorite(w http.ResponseWriter, r *http.Request, user utils.User) {
	propertyId := chi.URLParam(r, "propertyId")

	if propertyId == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Property ID is required")

		return
	}

	// Validate property ID
	validPropertyId, err := uuid.Parse(propertyId)

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid property ID")

		return
	}

	// Check if user is a tenant
	tenant, err := app.dbQuery.GetTenantByCognitoId(r.Context(), user.CognitoID)

	if err != nil {
		log.Printf("GetTenantByCognitoId DB err: %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Account not found!")
      
        return
	}

	// Check if favorite exists
	favorite, err := app.dbQuery.GetFavourite(r.Context(), database.GetFavouriteParams{
		PropertyID: validPropertyId,
		TenantID: tenant.ID,
	})

	if (err == nil && favorite.ID != uuid.Nil) {
		err := app.dbQuery.RemoveFavourite(r.Context(), database.RemoveFavouriteParams{
			ID: favorite.ID,
		    TenantID: tenant.ID,
			PropertyID: validPropertyId,
		})

		if err != nil {
			log.Printf("RemoveFavourite DB err: %v", err)

			utils.RespondWithError(w, http.StatusInternalServerError, "Unable to remove favourite!")
		
			return
		}

		utils.RespondWithJSON(w, http.StatusOK, "Removed from favourite!")

		return
	}

	addErr := app.dbQuery.AddFavourite(r.Context(), database.AddFavouriteParams{
		ID: uuid.New(),
		TenantID: tenant.ID,
		PropertyID: validPropertyId,
		CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
	})

	if addErr != nil {
		log.Printf("AddFavourite DB err: %v", addErr)

		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to add favourite!")
	
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, "Added to favourite!")
}