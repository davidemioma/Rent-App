package main

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"server/cmd/utils"
	"server/internal/database"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) getLease(w http.ResponseWriter, r *http.Request, user utils.User) {
	propertyId := chi.URLParam(r, "propertyId")

	// check if ID is valid
	validId, err := uuid.Parse(propertyId)

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid property ID format")
        
        return
	}

	// Check if user is a tenant
	tenant, err := app.dbQuery.GetTenantByCognitoId(r.Context(), user.CognitoID)

	if err != nil {
		log.Printf("checkFavorite (GetTenantByCognitoId) DB err: %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Account not found!")
      
        return
	}

	lease, err := app.dbQuery.GetPropertyLease(r.Context(), database.GetPropertyLeaseParams{
		PropertyID: validId,
		TenantID: tenant.ID,
	})

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, utils.JsonLease{})

			return
		} else {
			log.Printf("GetUserLeases DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Unable to get leases!")
		
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, utils.DBLeaseToJson(lease))
}

func (app *application) getLeasePayment(w http.ResponseWriter, r *http.Request, user utils.User) {
	leaseId := chi.URLParam(r, "leaseId")

	// check if ID is valid
	validId, err := uuid.Parse(leaseId)

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid property ID format")
        
        return
	}

	payments, err := app.dbQuery.GetLeasePayments(r.Context(), validId)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, []utils.JsonPayment{})

			return
		} else {
			log.Printf("GetLeasePayments DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Unable to get payments!")
		
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, utils.DBPaymentToJson(payments))
}

func (app *application) getManagerPropertyLeases(w http.ResponseWriter, r *http.Request, user utils.User) {
	propertyId := chi.URLParam(r, "propertyId")

	// check if ID is valid
	validId, err := uuid.Parse(propertyId)

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid property ID format")
        
        return
	}

	leases, err := app.dbQuery.GetManagerLeases(r.Context(),validId)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, utils.JsonLease{})

			return
		} else {
			log.Printf("GetUserLeases DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Unable to get leases!")
		
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, utils.DBMangerLeasesToJson(leases))
}

