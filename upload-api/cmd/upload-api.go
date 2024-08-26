package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	"os"

	pb "github.com/1001harps/source/upload-api/pkg/hooks/grpc/proto"
	"github.com/1001harps/source/upload-api/pkg/server"
	"github.com/1001harps/source/upload-api/pkg/service"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	_ "github.com/joho/godotenv/autoload"
	_ "github.com/lib/pq"
	"github.com/volatiletech/sqlboiler/boil"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/reflection"
)

func initStorage() *s3.S3 {
	s3session, err := session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_DEFAULT_REGION")),
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

	s3svc := initStorage()
	storageService := service.NewStorageService(service.NewStorageServiceConfig(os.Getenv("S3_BUCKET")), logger, s3svc)

	db := initDB()
	dataService := service.NewDataService(&ctx, db, logger)

	port := os.Getenv("PORT")

	lis, err := net.Listen("tcp", fmt.Sprintf("localhost:%s", port))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	creds := insecure.NewCredentials()
	opts := []grpc.ServerOption{grpc.Creds(creds)}

	grpcServer := grpc.NewServer(opts...)
	pb.RegisterHookHandlerServer(grpcServer, server.NewServer(logger, dataService, storageService))
	reflection.Register(grpcServer)

	logger.Info(fmt.Sprintf("server listening on port %s", port))
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}

}
