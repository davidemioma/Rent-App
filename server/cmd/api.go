package main

import (
	"database/sql"
	"net/http"
	"server/cmd/utils"
	"server/internal/database"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type application struct {
	dbConfig       *sql.DB
	dbQuery        *database.Queries
	s3Bucket       string
	cloudfront_url string
}

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	
	r.Use(middleware.RealIP)

	r.Use(middleware.Logger)

	r.Use(middleware.Recoverer)

	r.Use(middleware.Timeout(60 * time.Second))

	// Cors
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Routes
	r.Route("/api", func(r chi.Router) {
		r.Get("/health", utils.HandlerReadiness)

		r.Get("/err", utils.HandlerErr)

		r.Route("/tenants", func(r chi.Router) {
			r.Post("/", app.middlewareAuth([]string{"tenant"}, app.createTenant))

			r.Get("/{cognitoId}", app.middlewareAuth([]string{"tenant"}, app.getTenant))

			r.Patch("/{cognitoId}", app.middlewareAuth([]string{"tenant"}, app.updateTenant))

			r.Get("/{cognitoId}/residences", app.middlewareAuth([]string{"tenant"}, app.getCurrentResidences))

			r.Get("/{cognitoId}/favorites", app.middlewareAuth([]string{"tenant"}, app.getFavoriteProperties))

			r.Patch("/{cognitoId}/favorites/{propertyId}", app.middlewareAuth([]string{"tenant"}, app.toggleFavorite))
		})

		r.Route("/managers", func(r chi.Router) {
			r.Post("/", app.middlewareAuth([]string{"manager"}, app.createManager))

			r.Get("/{cognitoId}", app.middlewareAuth([]string{"manager"}, app.getManager))

			r.Patch("/{cognitoId}", app.middlewareAuth([]string{"manager"}, app.updateManager))

			r.Get("/{cognitoId}/properties", app.middlewareAuth([]string{"manager"}, app.getManagerProperties))
		})

		r.Route("/properties", func(r chi.Router) {
			r.Post("/", app.middlewareAuth([]string{"manager"}, app.createProperty))

			r.Get("/", app.getProperties)

			r.Get("/{id}",app.getProperty)
		})

		r.Route("/leases", func(r chi.Router) {
			r.Get("/", app.middlewareAuth([]string{"manager", "tenant"}, app.getLeases))

			r.Get("/{leaseId}/payments", app.middlewareAuth([]string{"manager", "tenant"}, app.getLeasePayment))
		})

		r.Route("/applications", func(r chi.Router) {
			r.Get("/", app.middlewareAuth([]string{"manager", "tenant"}, app.getAllApplications))

			r.Post("/", app.middlewareAuth([]string{"tenant"}, app.createApplication))

			r.Patch("/{id}/status", app.middlewareAuth([]string{"manager"}, app.updateApplicationStatus))
		})
	})

	return r
}

func (app *application) run(port string, handler http.Handler) error {
	srv := &http.Server{
		Addr:         port,
		Handler:      handler,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	err := srv.ListenAndServe()

	if err != nil {
		return err
	}

	return nil
}