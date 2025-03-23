package main

import (
	"log"
	"net/http"
	"server/cmd/utils"
	"server/internal/auth"
	"strings"
)

type AuthHandler func (http.ResponseWriter, *http.Request, utils.User)

func (app *application) middlewareAuth(allowedRoles []string, handler AuthHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get bearer token from headers
		bearer, err := auth.GetBearerToken(r.Header)

		if err != nil {
		    log.Printf("Couldn't get Bearer Token: %v", err)

		    utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized! Couldn't get Bearer Token")

		    return
	    }

		// Decrypt token
		claims, err := auth.DecryptToken(bearer)

		if err != nil {
		    log.Printf("Decrypt Token Err: %v", err)

		    utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized! Invalid Token")

		    return
	    }

		// Extract user ID and role
        userID := claims.Subject

        userRole := claims.CustomRole

		// Check if the user has the required role
        hasAccess := false

		for _, role := range allowedRoles {
			if strings.EqualFold(userRole, role) {
				hasAccess = true

				break
			}
		}

		if (!hasAccess) {
			utils.RespondWithError(w, http.StatusUnauthorized, "Unauthorized! You are not allowed to perform this action.")

			return
		}

		// Allow the user go through
		handler(w, r, utils.User{
			CognitoID: userID,
			Role: userRole,
		})
	}
}