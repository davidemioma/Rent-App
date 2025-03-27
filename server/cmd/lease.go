package main

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"server/cmd/utils"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) getLeases(w http.ResponseWriter, r *http.Request, user utils.User) {
	leases, err := app.dbQuery.GetPropertyLeases(r.Context())

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, []utils.JsonLease{})

			return
		} else {
			log.Printf("GetUserLeases DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Unable to get leases!")
		
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, utils.DBLeaseToJson(leases))
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