package main

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"server/cmd/utils"
	"server/internal/database"

	"github.com/google/uuid"
)

func (app *application) applocationList(w http.ResponseWriter, r *http.Request, user utils.User) {
	var userRole string

	if (user.Role == "manager") {
		userRole = "manager"
	} else if (user.Role == "tenant") {
		userRole = "tenant"
	}

	applications, err := app.dbQuery.GetUserApplications(r.Context(), database.GetUserApplicationsParams{
		Column1: userRole,
		ManagerID: uuid.MustParse(user.CognitoID),
	})

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.RespondWithJSON(w, http.StatusOK, []database.GetUserApplicationsRow{})

			return
		} else {
			log.Printf("GetUserApplications DB err: %v", err)

			utils.RespondWithError(w, http.StatusNotFound, "Unable to get applications!")
		
			return
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, applications)
}