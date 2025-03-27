package main

import (
	"log"
	"net/http"
	"server/cmd/utils"
	"server/internal/database"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

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
			ID: favorite.ID,
		    TenantID: tenant.ID,
			PropertyID: validPropertyId,
		})

	if addErr != nil {
		log.Printf("AddFavourite DB err: %v", addErr)

		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to add favourite!")
	
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, "Added to favourite!")
}