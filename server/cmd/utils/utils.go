package utils

import (
	"encoding/json"
	"net/http"
)

func DecodeJSONBody[T any](r *http.Request) (T, error) {
	var params T

	defer r.Body.Close()

	// Decode the JSON body into the struct
	err := json.NewDecoder(r.Body).Decode(&params)

	if err != nil {
		return params, err
	}

	return params, nil
}