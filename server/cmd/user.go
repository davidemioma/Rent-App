package main

import (
	"log"
	"net/http"
	"server/cmd/utils"
	"server/internal/database"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (app *application) getManager(w http.ResponseWriter, r *http.Request, user utils.User) {
	// Get the workspace id from the URL params
    cognitoId := chi.URLParam(r, "cognitoId")

	// Get tenant from database
	manager, err := app.dbQuery.GetManagerByCognitoId(r.Context(), cognitoId)

	if err != nil {
		log.Printf("getManager err: %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Couldn't get manager")

		return
	}

	utils.RespondWithJSON(w, http.StatusOK, utils.DBManagerToJson(manager))
}

func (app *application) getTenant(w http.ResponseWriter, r *http.Request, user utils.User) {
	// Get the workspace id from the URL params
    cognitoId := chi.URLParam(r, "cognitoId")

	// Get tenant from database
	tenant, err := app.dbQuery.GetTenantByCognitoId(r.Context(), cognitoId)

	if err != nil {
		log.Printf("getTenant err: %v", err)

		utils.RespondWithError(w, http.StatusNotFound, "Couldn't get tenant")

		return
	}

	utils.RespondWithJSON(w, http.StatusOK, utils.DBTenantToJson(tenant))
}

func (app *application) createManager(w http.ResponseWriter, r *http.Request, user utils.User) {
	type Params struct {
		Name        string    `json:"name"`
		Email       string    `json:"email"`
		Phonenumber string    `json:"phonenumber"`
	}

	// Validate Body
	params, err := utils.DecodeJSONBody[Params](r)

	if err != nil {
		log.Printf("Error parsing JSON in createManager: %v", err)
		
		utils.RespondWithError(w, http.StatusBadRequest, "Error parsing JSON")

		return
	}

	manager, err := app.dbQuery.CreateManager(r.Context(), database.CreateManagerParams{
		ID: uuid.New(),
		CognitoID: user.CognitoID,
		Name: params.Name,
		Email: params.Email,
		Phonenumber: params.Phonenumber,
	})

	if err != nil {
		log.Printf("createManager Err: %v", err)

		utils.RespondWithError(w, http.StatusInternalServerError, "Something went wrong! Couldn't create manager")

		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, utils.DBManagerToJson(manager))
}

func (app *application) createTenant(w http.ResponseWriter, r *http.Request, user utils.User) {
	type Params struct {
		Name        string    `json:"name"`
		Email       string    `json:"email"`
		Phonenumber string    `json:"phonenumber"`
	}

	// Validate Body
	params, err := utils.DecodeJSONBody[Params](r)

	if err != nil {
		log.Printf("Error parsing JSON in createTenant: %v", err)
		
		utils.RespondWithError(w, http.StatusBadRequest, "Error parsing JSON")

		return
	}

	tenant, err := app.dbQuery.CreateTenant(r.Context(), database.CreateTenantParams{
		ID: uuid.New(),
		CognitoID: user.CognitoID,
		Name: params.Name,
		Email: params.Email,
		Phonenumber: params.Phonenumber,
	})

	if err != nil {
		log.Printf("createTenant Err: %v", err)

		utils.RespondWithError(w, http.StatusInternalServerError, "Something went wrong! Couldn't create tenant")

		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, utils.DBTenantToJson(tenant))
}