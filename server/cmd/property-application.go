package main

import (
	"context"
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

func (app *application) getAllApplications(w http.ResponseWriter, r *http.Request, user utils.User) {
	var userId uuid.UUID

	var applicationsWithLease []utils.ApplicationReturnType

	if (user.Role == "manager") {
		manager, err := app.dbQuery.GetManagerByCognitoId(r.Context(), user.CognitoID)

		if err != nil {
			log.Printf("GetManagerByCognitoId (getAllApplications) DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Account not found!")
		
			return
		}

		userId = manager.ID
	} else if (user.Role == "tenant") {
		tenant, err := app.dbQuery.GetTenantByCognitoId(r.Context(), user.CognitoID)

		if err != nil {
			log.Printf("getAllApplications (GetTenantByCognitoId) DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Account not found!")
		
			return
		}

		userId = tenant.ID
	}

	applications, err := app.dbQuery.GetUserApplications(r.Context(), database.GetUserApplicationsParams{
		Column1: user.Role,
		ManagerID: userId,
	})

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, []utils.ApplicationReturnType{})

			return
		} else {
			log.Printf("GetUserApplications DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Unable to get applications!")
		
			return
		}
	}

	jsonApplication := utils.DBApplicationsToJson(applications)

	for _, application := range jsonApplication {
		lease, err := app.dbQuery.GetLease(r.Context(), application.LeaseID.UUID)

        if err != nil {
			log.Printf("getApplocationList (GetLease) DB err: %v", err)

			applicationsWithLease = append(applicationsWithLease, utils.ApplicationReturnType{
				Details: application,
				Lease: utils.ApplictionLease{},
		    })
		
			continue
		}

		applicationsWithLease = append(applicationsWithLease, utils.ApplicationReturnType{
			Details: application,
			Lease: utils.ApplictionLease{
				ID: lease.ID,
				PropertyID: lease.PropertyID,
				TenantID: lease.TenantID,
				Rent: lease.Rent,
				Deposit: lease.Deposit,
				StartDate: lease.StartDate,
				EndDate: lease.EndDate,
				NextPaymentDate: utils.CalculateNextPaymentDate(lease.StartDate),
			},
		})
	}

	utils.RespondWithJSON(w, http.StatusOK, applicationsWithLease)
}

func (app *application) WithTx(ctx context.Context, fn func(*database.Queries) error) error {
	tx, err := app.dbConfig.BeginTx(ctx, nil)

    if err != nil {
        return err
    }

	// Initialize sqlc transaction handler
	qtx := database.New(tx)

	err = fn(qtx)

	if err != nil {
        if rbErr := tx.Rollback(); rbErr != nil {
            return fmt.Errorf("tx err: %v, rb err: %v", err, rbErr)
        }

        return err
    }

	return tx.Commit()
}

func (app *application) createApplication(w http.ResponseWriter, r *http.Request, user utils.User) {
	// Get the request body
	type Params struct {
		PropertyId      string    `json:"propertyId"`
		Name            string    `json:"name"`
		Email           string    `json:"email"`
		PhoneNumber     string    `json:"phoneNumber"`
		Message         string    `json:"message"`
	}

	// Validate Body
	params, err := utils.DecodeJSONBody[Params](r)

	if err != nil {
		log.Printf("Error parsing JSON in createApplocation: %v", err)
		
		utils.RespondWithError(w, http.StatusBadRequest, "Error parsing JSON")

		return
	}

	// Create lease then property using db transaction
	tsxErr := app.WithTx(r.Context(), func(q *database.Queries) error {
		// Check if user is a tenant
		tenant, err := app.dbQuery.GetTenantByCognitoId(r.Context(), user.CognitoID)

		if err != nil {
			log.Printf("createApplocation(GetTenantByCognitoId) DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Account not found!")
		
			return err
		}

		// Get property to confirm
		property, err := app.dbQuery.GetProperty(r.Context(), uuid.MustParse(params.PropertyId))

		if err != nil {
			log.Printf("createApplocation(GetProperty) DB err: %v", err)
		
			utils.RespondWithError(w, http.StatusNotFound, "Property not found! You cannot create an application.")

			return err
		}

		// Create Lease
		lease, err := app.dbQuery.CreateLease(r.Context(), database.CreateLeaseParams{
			ID: uuid.New(),
			PropertyID: property.ID,
			TenantID: tenant.ID,
			Rent: property.PricePerMonth,
			Deposit: property.SecurityDeposit,
			StartDate: time.Now(),
			EndDate: time.Now().AddDate(1, 0, 0),
		})

		if err != nil {
			log.Printf("createApplocation(CreateLease) DB err: %v", err)
		
			utils.RespondWithError(w, http.StatusInternalServerError, "Unable to create lease! Try again.")

			return err
		}

		// Create Application
		appErr := app.dbQuery.CreateApplication(r.Context(), database.CreateApplicationParams{
			ID: uuid.New(),
			PropertyID: property.ID,
			TenantID: tenant.ID,
			LeaseID: uuid.NullUUID{
				UUID:  lease.ID,
				Valid: lease.ID != uuid.Nil,
			},
			Name: params.Name,
			Email: params.Email,
			PhoneNumber: params.PhoneNumber,
			Message: sql.NullString{
				String: params.Message,
				Valid: len(params.Message) > 0,
			},
			Status: database.ApplicationStatusPENDING,
			ApplicationDate: time.Now(),
		})

		if appErr != nil {
			log.Printf("createApplocation(CreateApplication) DB err: %v", appErr)
		
			utils.RespondWithError(w, http.StatusInternalServerError, "Unable to create application! Try again.")

			return appErr
		}

		return nil
	})

	if tsxErr != nil {
		log.Printf("createApplication trransaction DB err: %v", tsxErr)
		
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to create application! Try again.")

		return 
	}

	utils.RespondWithJSON(w, http.StatusCreated, "Application Created!")
}

func (app *application) updateApplicationStatus(w http.ResponseWriter, r *http.Request, user utils.User) {
	id := chi.URLParam(r, "id")

	// Get the request body
	type Params struct {
		Status string `json:"status"`
	}

	// Validate Body
	params, err := utils.DecodeJSONBody[Params](r)

	if err != nil {
		log.Printf("Error parsing JSON in updateApplicationStatus: %v", err)
		
		utils.RespondWithError(w, http.StatusBadRequest, "Error parsing JSON")

		return
	}

	// Check if application exists
	application, err := app.dbQuery.GetApplication(r.Context(), uuid.MustParse(id))

	if err != nil {
		log.Printf("updateApplicationStatus (GetApplication) DB err: %v", err)
		
		utils.RespondWithError(w, http.StatusNotFound, "Application not found!")

		return 
	}

	// if status is approved create a new lease and update property tenant Id.
	if params.Status == string(database.ApplicationStatusAPPROVED) {
		tsxErr := app.WithTx(r.Context(), func(q *database.Queries) error {
			newLease, err := app.dbQuery.CreateLease(r.Context(), database.CreateLeaseParams{
				ID: uuid.New(),
				PropertyID: application.PropertyID,
				TenantID: application.TenantID,
				Rent: application.PricePerMonth,
				Deposit: application.SecurityDeposit,
				StartDate: time.Now(),
				EndDate: time.Now().AddDate(1, 0, 0),
			})

			if err != nil {
				log.Printf("updateApplicationStatus (CreateLease) DB err: %v", err)
				
				utils.RespondWithError(w, http.StatusInternalServerError, "Unable to create lease. Try again")

				return err
			}

			// Update property tenant
			propertyErr := app.dbQuery.UpdateProperty(r.Context(), database.UpdatePropertyParams{
				ID: application.PropertyID,
				TenantID: uuid.NullUUID{
					UUID: newLease.TenantID,
					Valid: newLease.TenantID != uuid.Nil,
				},
			})

			if propertyErr != nil {
				log.Printf("updateApplicationStatus (UpdateProperty) DB err: %v", err)
				
				utils.RespondWithError(w, http.StatusInternalServerError, "Unable to update property. Try again")

				return propertyErr
			}

			// Update application status and lease Id.
			appErr := app.dbQuery.UpdateApplication(r.Context(), database.UpdateApplicationParams{
				ID: application.ID,
				Column1: newLease.ID,
				Status: database.ApplicationStatus(params.Status),
			})

			if appErr != nil {
				log.Printf("updateApplicationStatus (UpdateApplication) DB err: %v", appErr)
				
				utils.RespondWithError(w, http.StatusInternalServerError, "Unable to update application. Try again")

				return appErr
			}

			return nil
		})

		if tsxErr != nil {
			log.Printf("updateApplicationStatus (transaction) DB err: %v", err)
				
			utils.RespondWithError(w, http.StatusInternalServerError, "Unable to update application. Try again")

			return
		}

		utils.RespondWithJSON(w, http.StatusOK, "Application Updated!")

		return
	}

	// Update status
	dbErr := app.dbQuery.UpdateApplicationStatus(r.Context(), database.UpdateApplicationStatusParams{
		ID: application.ID,
		Status: database.ApplicationStatus(params.Status),
	})

	if dbErr != nil {
		log.Printf("updateApplicationStatus (UpdateApplication) DB err: %v", dbErr)
		
		utils.RespondWithError(w, http.StatusInternalServerError, "Unable to update application! Try again.")

		return 
	}

	utils.RespondWithJSON(w, http.StatusOK, "Application Updated!")
}