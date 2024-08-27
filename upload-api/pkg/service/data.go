package service

import (
	"context"
	"database/sql"

	"github.com/1001harps/source/upload-api/pkg/models"
	"github.com/volatiletech/sqlboiler/v4/boil"
	"go.uber.org/zap"
)

type DataService struct {
	ctx    *context.Context
	logger *zap.Logger
	db     *sql.DB
}

func NewDataService(ctx *context.Context, db *sql.DB, logger *zap.Logger) *DataService {
	return &DataService{ctx, logger, db}
}

func (svc *DataService) GetTenantByAPIKey(apiKey string) (*models.Tenant, error) {
	return models.Tenants(models.TenantWhere.ApiKey.EQ(apiKey)).One(*svc.ctx, svc.db)
}

func (svc *DataService) CreateFile(tenantId string) (*models.File, error) {
	var file models.File
	file.TenantId = tenantId
	err := file.Insert(*svc.ctx, svc.db, boil.Infer())
	return &file, err
}

func (svc *DataService) GetFile(tenantId string, id string) (*models.File, error) {
	return models.Files(
		models.FileWhere.TenantId.EQ(tenantId),
		models.FileWhere.ID.EQ(id),
	).One(*svc.ctx, svc.db)
}

func (svc *DataService) SetFileUploadCancelled(tenantId string, id string) error {
	file, err := svc.GetFile(tenantId, id)
	if err != nil {
		return err
	}
	file.Active = false
	file.Deleted = true
	file.UploadError = true

	return svc.UpdateFile(file)
}

func (svc *DataService) SetFileActive(tenantId string, id string) error {
	file, err := svc.GetFile(tenantId, id)
	if err != nil {
		return err
	}
	file.Active = true
	return svc.UpdateFile(file)
}

func (svc *DataService) UpdateFile(file *models.File) error {
	rowsAffected, err := file.Update(*svc.ctx, svc.db, boil.Infer())
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return err
}
