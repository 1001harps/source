package service

import (
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"go.uber.org/zap"
)

type StorageServiceConfig struct {
	Bucket string
}

func NewStorageServiceConfig(bucket string) *StorageServiceConfig {
	return &StorageServiceConfig{bucket}
}

type StorageService struct {
	config *StorageServiceConfig
	logger *zap.Logger
	s3svc  *s3.S3
}

func NewStorageService(config *StorageServiceConfig, logger *zap.Logger, s3svc *s3.S3) *StorageService {
	return &StorageService{config, logger, s3svc}
}

func (svc *StorageService) DeleteFile(path string) error {
	_, err := svc.s3svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(svc.config.Bucket),
		Key:    aws.String(path),
	})
	return err
}

func (svc *StorageService) MoveFile(source string, destination string, contentType string) error {
	svc.logger.Info("MoveFile ", zap.String("bucket", svc.config.Bucket), zap.String("source", source), zap.String("destination", destination))

	sourcePath := fmt.Sprintf("%s/%s", svc.config.Bucket, source)

	_, err := svc.s3svc.CopyObject(&s3.CopyObjectInput{
		Bucket:      aws.String(svc.config.Bucket),
		CopySource:  aws.String(sourcePath),
		Key:         aws.String(destination),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return err
	}

	return svc.DeleteFile(source)
}
