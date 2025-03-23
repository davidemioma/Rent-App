package utils

import (
	"server/internal/database"

	"github.com/google/uuid"
)

type User struct{
	CognitoID   string
	Role        string
}

type JsonTenant struct {
	ID          uuid.UUID `json:"id"`
	CognitoID   string    `json:"cognitoID"`
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	Phonenumber string    `json:"phonenumber"`
}

func DBTenantToJson(tenant database.Tenant) JsonTenant {
	return JsonTenant{
		ID: tenant.ID,
		CognitoID: tenant.CognitoID,
		Name: tenant.Name,
		Email: tenant.Email,
		Phonenumber: tenant.Phonenumber,
	}
}

type JsonManager struct {
	ID          uuid.UUID `json:"id"`
	CognitoID   string    `json:"cognitoID"`
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	Phonenumber string    `json:"phonenumber"`
}

func DBManagerToJson(manager database.Manager) JsonManager {
	return JsonManager{
		ID: manager.ID,
		CognitoID: manager.CognitoID,
		Name: manager.Name,
		Email: manager.Email,
		Phonenumber: manager.Phonenumber,
	}
}