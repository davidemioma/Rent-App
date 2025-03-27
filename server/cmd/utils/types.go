package utils

import (
	"database/sql"
	"encoding/json"
	"mime/multipart"
	"server/internal/database"
	"time"

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

type JsonFilteredProperties struct {
    ID                uuid.UUID       `json:"id"`
    Name              string          `json:"name"`
    Description       string          `json:"description"`
    PricePerMonth     string          `json:"pricePerMonth"`
    SecurityDeposit   string          `json:"securityDeposit"`
    ApplicationFee    string          `json:"applicationFee"`
    PhotoUrls         []string        `json:"photoUrls"`
    IsPetsAllowed     bool            `json:"isPetsAllowed"`
    IsParkingIncluded bool            `json:"isParkingIncluded"`
    Beds              int32           `json:"beds"`
    Baths             string          `json:"baths"`
    SquareFeet        int32           `json:"squareFeet"`
    PropertyType      string          `json:"propertyType"`
    AverageRating     sql.NullString  `json:"averageRating"`
    NumberOfReviews   sql.NullInt32   `json:"numberOfReviews"`
    LocationID        uuid.UUID       `json:"locationId"`
    ManagerID         uuid.UUID       `json:"managerId"`
    CreatedAt         time.Time       `json:"createdAt"`
    UpdatedAt         time.Time       `json:"updatedAt"`
    Location          json.RawMessage `json:"location"`
}	

func DBFilteredPropertyToJson(property database.GetFilteredPropertiesRow) JsonFilteredProperties {
	return JsonFilteredProperties{
		ID:                property.ID,
		Name:              property.Name,
		Description:       property.Description,
		PricePerMonth:     property.PricePerMonth,
		SecurityDeposit:   property.SecurityDeposit,
		ApplicationFee:    property.ApplicationFee,
		PhotoUrls:         property.PhotoUrls,
		IsPetsAllowed:     property.IsPetsAllowed,
		IsParkingIncluded: property.IsParkingIncluded,
		Beds:              property.Beds,
		Baths:             property.Baths,
		SquareFeet:        property.SquareFeet,
		PropertyType:      string(property.PropertyType),
		AverageRating:     property.AverageRating,
		NumberOfReviews:   property.NumberOfReviews,
		LocationID:        property.LocationID,
		ManagerID:         property.ManagerID,
		CreatedAt:         property.CreatedAt,
		UpdatedAt:         property.UpdatedAt,
		Location:          property.Location,
    }
}

func DBFilteredPropertiesToJson(properties []database.GetFilteredPropertiesRow) []JsonFilteredProperties {
	var jsonProperties []JsonFilteredProperties

	for _, property := range properties{
		jsonProperties = append(jsonProperties, DBFilteredPropertyToJson(property))
	}

	return jsonProperties
}
type Coordinates struct {
	Longitude float64 `json:"longitude"`
    Latitude  float64 `json:"latitude"`
}

type JsonLocation struct {
	ID                uuid.UUID       `json:"id"`
	Address           string          `json:"address"`
    City              string          `json:"city"`
    State             string          `json:"state"`
    Country           string          `json:"country"`
    PostalCode        string          `json:"postalCode"`
	Coordinates       Coordinates     `json:"coordinates"`
}

type JsonProperty struct {
    ID                uuid.UUID       `json:"id"`
    Name              string          `json:"name"`
    Description       string          `json:"description"`
    PricePerMonth     string          `json:"pricePerMonth"`
    SecurityDeposit   string          `json:"securityDeposit"`
    ApplicationFee    string          `json:"applicationFee"`
    PhotoUrls         []string        `json:"photoUrls"`
    IsPetsAllowed     bool            `json:"isPetsAllowed"`
    IsParkingIncluded bool            `json:"isParkingIncluded"`
    Beds              int32           `json:"beds"`
    Baths             string          `json:"baths"`
    SquareFeet        int32           `json:"squareFeet"`
    PropertyType      string          `json:"propertyType"`
	AverageRating     sql.NullString  `json:"averageRating"`
    NumberOfReviews   sql.NullInt32   `json:"numberOfReviews"`
    LocationID        uuid.UUID       `json:"locationId"`
	Location          JsonLocation    `json:"location"`
    ManagerID         uuid.UUID       `json:"managerId"`
    CreatedAt         time.Time       `json:"createdAt"`
    UpdatedAt         time.Time       `json:"updatedAt"`
}

type JsonLeaseProperty struct {
	ID         uuid.UUID    `json:"id"`
	Rent       string       `json:"rent"`
	Deposit    string       `json:"deposit"`
	StartDate  time.Time    `json:"start_date"`
	EndDate    time.Time    `json:"end_date"`
	Property   JsonProperty `json:"property"`
}

func DBpropertyToJson(property database.GetPropertyRow, lat float64, lng float64) JsonProperty {
	return JsonProperty{
		ID: property.ID,
		Name: property.Name,
		Description:       property.Description,
		PricePerMonth:     property.PricePerMonth,
		SecurityDeposit:   property.SecurityDeposit,
		ApplicationFee:    property.ApplicationFee,
		PhotoUrls:         property.PhotoUrls,
		IsPetsAllowed:     property.IsPetsAllowed,
		IsParkingIncluded: property.IsParkingIncluded,
		Beds:              property.Beds,
		Baths:             property.Baths,
		SquareFeet:        property.SquareFeet,
		PropertyType:      string(property.PropertyType),
		AverageRating:     property.AverageRating,
		NumberOfReviews:   property.NumberOfReviews,
		LocationID:        property.LocationID,
		ManagerID:         property.ManagerID,
		CreatedAt:         property.CreatedAt,
		UpdatedAt:         property.UpdatedAt,
		Location:          JsonLocation{
			ID: property.LocationID,
			Address: property.Address.String,
			City: property.City.String,
            State: property.State.String,
			Country: property.Country.String,
            PostalCode: property.PostalCode.String,
			Coordinates: Coordinates{
				Latitude: lat,
				Longitude: lng,
			},
		},
	}
}

type UploadedFile struct {
	File        multipart.File
	Header      *multipart.FileHeader
	ContentType string
	Extension   string
}

type PropertyData struct {
	Name               string
	Description        string
	PricePerMonth      float64
	SecurityDeposit    float64
	ApplicationFee     float64
	IsPetsAllowed      bool
	IsParkingIncluded  bool
	Beds               int
	Baths              float64
	SquareFeet         int
	PropertyType       string
	AverageRating      float64
	NumberOfReviews    int
	UploadedFiles      []UploadedFile
}

type PropertyFormData struct {
	Address      string
	City         string
	State        string
	Country      string
	PostalCode   string
	PropertyData PropertyData
}
