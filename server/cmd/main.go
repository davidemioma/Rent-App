package main

import (
	"log"
	"os"
	"server/internal/database"

	"github.com/lpernett/godotenv"

	_ "github.com/lib/pq"
)

func main() {
	godotenv.Load(".env")

	port := os.Getenv("PORT")

	if port == ""{
	    log.Fatal("PORT not found")
	}

	// Connect to database
	db := connToDB()

	app := application{
		dbConfig: db, // For transactions.
		dbQuery: database.New(db), // For regular queries.
	}

	// Run the server
	r := app.mount()

	log.Printf("Server running on port %v", port)

	log.Fatal(app.run("0.0.0.0:" + port, r))
}