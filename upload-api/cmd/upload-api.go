package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/1001harps/source/upload-api/pkg/service"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	_ "github.com/joho/godotenv/autoload"
	_ "github.com/lib/pq"
	"github.com/volatiletech/sqlboiler/boil"
	"go.uber.org/zap"
)

func initStorage() *s3.S3 {
	s3session, err := session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_DEFAULT_REGION")),
		// LogLevel: aws.LogLevel(aws.LogDebugWithHTTPBody),
		// Logger:   aws.NewDefaultLogger(),
	})
	if err != nil {
		log.Fatal(err)
	}

	return s3.New(s3session)

}

func initDB() *sql.DB {
	host := os.Getenv("POSTGRES_HOST")
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	port := 5432
	dbname := "source"

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal(err)
	}

	boil.SetDB(db)

	return db
}

func main() {
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	ctx := context.Background()

	bucket := os.Getenv("S3_BUCKET")
	if bucket == "" {
		logger.Fatal("S3_BUCKET is not set")
	}

	s3svc := initStorage()
	storageService := service.NewStorageService(service.NewStorageServiceConfig(bucket), logger, s3svc)

	db := initDB()
	dataService := service.NewDataService(&ctx, db, logger)

	port := os.Getenv("PORT")

	handler := service.NewHookHandlerService(logger, dataService, storageService)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Post("/", func(w http.ResponseWriter, r *http.Request) {
		res := handler.InvokeHook(r)
		body, err := json.Marshal(res)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(body)
	})
	logger.Info("starting server on port " + port)
	http.ListenAndServe(fmt.Sprintf(":%s", port), r)
}
