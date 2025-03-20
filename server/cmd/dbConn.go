package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/lpernett/godotenv"
)

func connToDB() *sql.DB {
	godotenv.Load(".env")

	dbUrl := os.Getenv("DATABASE_URL")

	if dbUrl == ""{
		log.Fatal("DATABASE_URL not found")
	}

	db, err := sql.Open("postgres", dbUrl)

	if err != nil {
		log.Fatal("Can't connect to database:", err)
	}

	return db
}