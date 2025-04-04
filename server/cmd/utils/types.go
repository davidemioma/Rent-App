package utils

import (
	"database/sql"
	"encoding/json"
	"log"
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
	TenantID          uuid.NullUUID   `json:"tenantId"`
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
		TenantID:          property.TenantID,
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
	TenantID          uuid.NullUUID   `json:"tenantId"`
    CreatedAt         time.Time       `json:"createdAt"`
    UpdatedAt         time.Time       `json:"updatedAt"`
}

type FavoriteProperty struct {
	FavoriteID          uuid.UUID             `json:"favoriteId"`
	TenantID            uuid.UUID             `json:"tenantId"`
	PropertyID          uuid.UUID             `json:"propertyId"`
	PropertyName        string                `json:"propertyName"`
	PropertyDescription string                `json:"propertyDescription"`
	PropertyManagerID   uuid.UUID             `json:"propertyManagerId"`
    PropertyTenantID    uuid.NullUUID         `json:"propertyTenantId"`
	PricePerMonth       string                `json:"pricePerMonth"`
	SecurityDeposit     string                `json:"securityDeposit"`
	ApplicationFee      string                `json:"applicationFee"`
	PhotoUrls           []string              `json:"photoUrls"`
	IsPetsAllowed       bool                  `json:"isPetsAllowed"`
	IsParkingIncluded   bool                  `json:"isParkingIncluded"`
	Beds                int32                 `json:"beds"`
	Baths               string                `json:"baths"`
	SquareFeet          int32                 `json:"squareFeet"`
	PropertyType        database.PropertyType `json:"propertyType"`
	AverageRating       sql.NullString        `json:"averageRating"`
	NumberOfReviews     sql.NullInt32         `json:"numberOfReviews"`
	PropertyCreatedAt   time.Time             `json:"propertyCreatedAt"`
	PropertyUpdatedAt   time.Time             `json:"propertyUpdatedAt"`
	LocationID          uuid.UUID             `json:"locationId"`
	Address             string                `json:"address"`
	City                string                `json:"city"`
	State               string                `json:"state"`
	Country             string                `json:"country"`
	PostalCode          string                `json:"postalCode"`
	Coordinates         Coordinates           `json:"coordinates"`
}

func DBfavouriteToJson(property database.GetFavouritePropertiesRow, lat float64, lng float64) FavoriteProperty {
	return FavoriteProperty{
		FavoriteID:          property.FavoriteID,
        TenantID:            property.TenantID,
        PropertyID:          property.PropertyID,
        PropertyName:        property.PropertyName,
		PropertyManagerID:   property.PropertyManagerID,
		PropertyTenantID:    uuid.NullUUID{
			UUID: property.PropertyTenantID.UUID,
			Valid: property.PropertyTenantID.UUID != uuid.Nil,
		},
        PropertyDescription: property.PropertyDescription,
        PricePerMonth:       property.PricePerMonth,
        SecurityDeposit:     property.SecurityDeposit,
        ApplicationFee:      property.ApplicationFee,
        PhotoUrls:           property.PhotoUrls,
        IsPetsAllowed:       property.IsPetsAllowed,
        IsParkingIncluded:   property.IsParkingIncluded,
        Beds:                property.Beds,
        Baths:               property.Baths,
        SquareFeet:          property.SquareFeet,
        PropertyType:        property.PropertyType,
		AverageRating: sql.NullString{
            String: property.AverageRating.String,
            Valid:  property.AverageRating.String != "",
        },
        NumberOfReviews: sql.NullInt32{
            Int32: property.NumberOfReviews.Int32,
            Valid: property.NumberOfReviews.Int32 != 0,
        },
        PropertyCreatedAt: property.PropertyCreatedAt,
        PropertyUpdatedAt: property.PropertyUpdatedAt,
		LocationID:        property.LocationID,
        Address:          property.Address,
        City:            property.City,
        State:           property.State,
        Country:         property.Country,
        PostalCode:      property.PostalCode,
		Coordinates: Coordinates{
            Latitude:  lat,
            Longitude: lng,
        },
	}
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
		TenantID:          property.TenantID,
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

type JsonLease struct {
	ID         uuid.UUID    `json:"id"`  
	PropertyID uuid.UUID    `json:"propertyId"` 
	TenantID   uuid.UUID    `json:"tenantId"` 
	Rent       string       `json:"rent"` 
	Deposit    string       `json:"deposit"` 
	StartDate  time.Time    `json:"startDate"` 
	EndDate    time.Time    `json:"endDate"` 
	Property   JsonProperty `json:"property"`
}

func DBLeaseToJson(lease database.GetPropertyLeaseRow) JsonLease {
	return JsonLease{
		ID: lease.ID,
		PropertyID: lease.PropertyID,
		TenantID: lease.TenantID,
		Rent: lease.Rent,
		Deposit: lease.Deposit,
		StartDate: lease.StartDate,
		EndDate: lease.EndDate,
		Property: JsonProperty{
			ID: lease.ID_2,
			Name: lease.Name,
			Description:       lease.Description,
			PricePerMonth:     lease.PricePerMonth,
			SecurityDeposit:   lease.SecurityDeposit,
			ApplicationFee:    lease.ApplicationFee,
			PhotoUrls:         lease.PhotoUrls,
			IsPetsAllowed:     lease.IsPetsAllowed,
			IsParkingIncluded: lease.IsParkingIncluded,
			Beds:              lease.Beds,
			Baths:             lease.Baths,
			SquareFeet:        lease.SquareFeet,
			PropertyType:      string(lease.PropertyType),
			AverageRating:     lease.AverageRating,
			NumberOfReviews:   lease.NumberOfReviews,
			LocationID:        lease.LocationID,
			ManagerID:         lease.ManagerID,
			TenantID:          lease.TenantID_2,
			CreatedAt:         lease.CreatedAt,
			UpdatedAt:         lease.UpdatedAt,
		},
	}
}

type JsonPayment struct {
	ID            uuid.UUID              `json:"id"`    
	LeaseID       uuid.UUID              `json:"leaseId"`
	AmountDue     string                 `json:"amountDue"`
	AmountPaid    string                 `json:"amountPaid"`
	DueDate       time.Time              `json:"dueDate"`
	PaymentDate   time.Time              `json:"paymentDate"`
	PaymentStatus database.PaymentStatus `json:"paymentStatus"`
}

func DBPaymentToJson(payments []database.Payment) []JsonPayment {
	var jsonPayments []JsonPayment

	for _, payment := range payments{
		jsonPayments = append(jsonPayments, JsonPayment{
			ID: payment.ID,
			LeaseID: payment.LeaseID,
			AmountDue: payment.AmountDue,
			AmountPaid: payment.AmountPaid,
			DueDate: payment.DueDate,
			PaymentDate: payment.PaymentDate,
			PaymentStatus: payment.PaymentStatus,
		})
	}

	return jsonPayments
}

type JsonApplication struct {
	ApplicationID              uuid.UUID                  `json:"application_id"`
    LeaseID                    uuid.NullUUID              `json:"leaseId"`
    ApplicationName            string                     `json:"applicationName"`
    ApplicationEmail           string                     `json:"applicationEmail"`
    ApplicationPhoneNumber     string                     `json:"applicationPhoneNumber"`
    ApplicationMessage         sql.NullString             `json:"applicationMessage"`
    ApplicationStatus          database.ApplicationStatus `json:"applicationStatus"`
    ApplicationApplicationDate time.Time                  `json:"applicationApplicationDate"`
    ID                         uuid.UUID                  `json:"id"`
    Name                       string                     `json:"name"`
    Description                string                     `json:"description"`
    PricePerMonth              string                     `json:"pricePerMonth"`
    SecurityDeposit            string                     `json:"securityDeposit"`
    ApplicationFee             string                     `json:"applicationFee"`
    PhotoUrls                  []string                   `json:"photoUrls"`
    IsPetsAllowed              bool                       `json:"isPetsAllowed"`
    IsParkingIncluded          bool                       `json:"isParkingIncluded"`
    Beds                       int32                      `json:"beds"`
    Baths                      string                     `json:"baths"`
    SquareFeet                 int32                      `json:"squareFeet"`
    PropertyType               database.PropertyType      `json:"propertyType"`
    AverageRating              sql.NullString             `json:"averageRating"`
    NumberOfReviews            sql.NullInt32              `json:"numberOfReviews"`
    LocationID                 uuid.UUID                  `json:"locationId"`
	TenantID                   uuid.NullUUID              `json:"tenantId"`
    ManagerID                  uuid.UUID                  `json:"managerId"`
    CreatedAt                  time.Time                  `json:"createdAt"`
    UpdatedAt                  time.Time                  `json:"updatedAt"`
    PropertyLocationID         uuid.UUID                  `json:"propertyLocationId"`
    LocationAddress            string                     `json:"locationAddress"`
    LocationCity               string                     `json:"locationCity"`
    LocationState              string                     `json:"locationState"`
    LocationCountry            string                     `json:"locationCountry"`
    LocationPostalCode         string                     `json:"locationPostalCode"`
    ManagerUserID              uuid.UUID                  `json:"managerUserId"`
    ManagerCognitoID           string                     `json:"managerCognitoId"`
    ManagerName                string                     `json:"managerName"`
    ManagerEmail               string                     `json:"managerEmail"`
    ManagerPhonenumber         string                     `json:"managerPhonenumber"`
    TenantUserID               uuid.UUID                  `json:"tenantUserId"`
    TenantCognitoID            string                     `json:"tenantCognitoId"`
    TenantName                 string                     `json:"tenantName"`
    TenantEmail                string                     `json:"tenantEmail"`
    TenantPhonenumber          string                     `json:"tenantPhonenumber"`
}

func DBApplicationsToJson(applications []database.GetUserApplicationsRow) []JsonApplication {
	var jsonApplications []JsonApplication

	for _, application := range applications{
		jsonApplications = append(jsonApplications, JsonApplication{
			ApplicationID: application.ApplicationID,
			LeaseID: application.LeaseID,
			ApplicationName: application.ApplicationName,
			ApplicationEmail: application.ApplicationEmail,
			ApplicationPhoneNumber: application.ApplicationPhoneNumber,
			ApplicationMessage: application.ApplicationMessage,
			ApplicationStatus: application.ApplicationStatus,
			ApplicationApplicationDate: application.ApplicationApplicationDate,
			ID: application.ID,
			Name: application.Name,
			Description: application.Description,
			PricePerMonth: application.PricePerMonth,
			SecurityDeposit: application.SecurityDeposit,
			ApplicationFee: application.ApplicationFee,
			PhotoUrls: application.PhotoUrls,
			IsPetsAllowed: application.IsPetsAllowed,
			IsParkingIncluded: application.IsParkingIncluded,
			Beds: application.Beds,
			Baths: application.Baths,
			SquareFeet: application.SquareFeet,
			PropertyType: application.PropertyType,
			AverageRating: application.AverageRating,
			NumberOfReviews: application.NumberOfReviews,
			LocationID: application.LocationID,
			TenantID: application.TenantID,
			ManagerID: application.ManagerID,
			CreatedAt: application.CreatedAt,
			UpdatedAt: application.UpdatedAt,
			PropertyLocationID: application.PropertyLocationID,
			LocationAddress: application.LocationAddress,
			LocationCity: application.LocationCity,
			LocationState: application.LocationState,
			LocationCountry: application.LocationCountry,
			LocationPostalCode: application.LocationPostalCode,
			ManagerUserID: application.ManagerUserID,
			ManagerCognitoID: application.ManagerCognitoID,
			ManagerName: application.ManagerName,
			ManagerEmail: application.ManagerEmail,
			ManagerPhonenumber: application.ManagerPhonenumber,
			TenantUserID: application.TenantUserID,
			TenantCognitoID: application.TenantCognitoID,
			TenantName: application.TenantName,
			TenantEmail: application.TenantEmail,
			TenantPhonenumber:  application.TenantPhonenumber,
		})
	}

	return jsonApplications
}

type ManageLease struct {
	ID              uuid.UUID    `json:"id"`  
	PropertyID      uuid.UUID    `json:"propertyId"` 
	TenantID        uuid.UUID    `json:"tenantId"` 
	Rent            string       `json:"rent"` 
	Deposit         string       `json:"deposit"` 
	StartDate       time.Time    `json:"startDate"` 
	EndDate         time.Time    `json:"endDate"` 
	Tenant          JsonTenant   `json:"tenant"`
	Payments       []JsonPayment `json:"payments"`
}	

func DBMangerLeasesToJson(leases []database.GetManagerLeasesRow) []ManageLease {
	var jsonLeases []ManageLease

	for _, lease := range leases{
		paymentsJSON, ok := lease.Payments.([]byte)

        if !ok {
            log.Printf("Payments is not []byte, got: %T", lease.Payments)
            continue
        }

        // Step 2: Unmarshal JSON into []JsonPayment
        var payments []JsonPayment

        if err := json.Unmarshal(paymentsJSON, &payments); err != nil {
            log.Printf("Failed to unmarshal payments: %v", err)
			
            continue
        }

		jsonLeases = append(jsonLeases, ManageLease{
			ID: lease.ID,
			PropertyID: lease.PropertyID,
			TenantID: lease.TenantID,
			Rent: lease.Rent,
			Deposit: lease.Deposit,
			StartDate: lease.StartDate,
			EndDate: lease.EndDate,
			Tenant: JsonTenant{
				ID: lease.ID_2,
				CognitoID: lease.CognitoID,
				Name: lease.Name,
				Email: lease.Email,
				Phonenumber: lease.Phonenumber,
			},
			Payments: payments,
		})
	}

	return jsonLeases
}

type ApplictionLease struct {
	ID              uuid.UUID    `json:"id"`  
	PropertyID      uuid.UUID    `json:"propertyId"` 
	TenantID        uuid.UUID    `json:"tenantId"` 
	Rent            string       `json:"rent"` 
	Deposit         string       `json:"deposit"` 
	StartDate       time.Time    `json:"startDate"` 
	EndDate         time.Time    `json:"endDate"` 
	NextPaymentDate time.Time    `json:"nextPaymentDate"`
}	

type ApplicationReturnType struct {
	Details JsonApplication  `json:"details"` 
	Lease   ApplictionLease  `json:"lease"`
}

func DBManagerPropertyToJson(property database.GetManagerPropertiesRow, lat float64, lng float64) JsonProperty {
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
		TenantID:          property.TenantID,
		CreatedAt:         property.CreatedAt,
		UpdatedAt:         property.UpdatedAt,
		Location:          JsonLocation{
			ID: property.LocationID,
			Address: property.Address,
			City: property.City,
            State: property.State,
			Country: property.Country,
            PostalCode: property.PostalCode,
			Coordinates: Coordinates{
				Latitude: lat,
				Longitude: lng,
			},
		},
	}
}