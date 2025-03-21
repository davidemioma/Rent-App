package handlers

import (
	"net/http"
	"server/cmd/utils"
)

func HandlerReadiness(w http.ResponseWriter, r *http.Request) {
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func HandlerErr(w http.ResponseWriter, r *http.Request) {
	utils.RespondWithError(w, http.StatusInternalServerError, "Internal Server Error")
}