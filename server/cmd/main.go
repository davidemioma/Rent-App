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

	// Get enviroment variables
	port := os.Getenv("PORT")

	if port == ""{
	    log.Fatal("PORT not found")
	}

	bucket := os.Getenv("AWS_BUCKET_NAME")

	if bucket == ""{
	    log.Fatal("AWS_BUCKET_NAME not found")
	}

	cloudfront_url := os.Getenv("AWS_CLOUD_FRONT_STREAM_URL")

	if cloudfront_url == ""{
	    log.Fatal("AWS_CLOUD_FRONT_STREAM_URL not found")
	}

	// Connect to database
	db := connToDB()

	app := application{
		dbConfig: db, // For transactions.
		dbQuery: database.New(db), // For regular queries.
		s3Bucket: bucket,
		cloudfront_url: cloudfront_url,
	}

	// Run the server
	r := app.mount()

	log.Printf("Server running on port %v", port)

	log.Fatal(app.run("0.0.0.0:" + port, r))
}