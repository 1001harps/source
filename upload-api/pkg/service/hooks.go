package service

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/tus/tusd/v2/pkg/handler"
	"github.com/tus/tusd/v2/pkg/hooks"
	"go.uber.org/zap"
)

var hookResponseOk = func(fileInfo handler.FileInfoChanges) *hooks.HookResponse {
	return &hooks.HookResponse{
		HTTPResponse: handler.HTTPResponse{
			StatusCode: 200,
		},
		ChangeFileInfo: fileInfo,
	}
}

var hookResponseBadRequest = func() *hooks.HookResponse {
	return &hooks.HookResponse{
		HTTPResponse: handler.HTTPResponse{
			StatusCode: 400,
		},
	}
}

var hookResponseForbidden = func() *hooks.HookResponse {
	return &hooks.HookResponse{
		HTTPResponse: handler.HTTPResponse{
			StatusCode: 403,
		},
		RejectUpload: true,
	}
}

var hooksResponseInternalServerError = func() *hooks.HookResponse {
	return &hooks.HookResponse{
		HTTPResponse: handler.HTTPResponse{
			StatusCode: 500,
		},
	}
}

type HookHandlerService struct {
	logger         *zap.Logger
	dataService    *DataService
	storageService *StorageService
}

func (svc *HookHandlerService) InvokeHook(r *http.Request) *hooks.HookResponse {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return hookResponseBadRequest()
	}
	var req hooks.HookRequest
	err = json.Unmarshal(body, &req)
	if err != nil {
		return hookResponseBadRequest()
	}

	fmt.Printf("req: %s\n", req.Type)

	apiKeyHeader, exists := req.Event.HTTPRequest.Header["X-Api-Key"]

	if !exists || len(apiKeyHeader) == 0 {
		return hookResponseForbidden()
	}

	apiKey := apiKeyHeader[0]

	if apiKey == "" {
		svc.logger.Error("missing api key")
		return hookResponseForbidden()
	}

	tenant, err := svc.dataService.GetTenantByAPIKey(apiKey)
	if err != nil {
		svc.logger.Error("tenant not found")
		return hookResponseForbidden()
	}

	if !tenant.Active {
		svc.logger.Error("tenant not active")
		return hookResponseForbidden()
	}

	switch req.Type {
	case "pre-create":
		file, err := svc.dataService.CreateFile(tenant.ID)
		if err != nil {
			return hooksResponseInternalServerError()
		}

		fileInfo := handler.FileInfoChanges{
			ID: file.ID,
			MetaData: map[string]string{
				"id": file.ID,
			},
		}

		return hookResponseOk(fileInfo)

	case "post-finish":
		{
			fileId, exists := req.Event.Upload.MetaData["id"]
			if !exists || fileId == "" {
				svc.logger.Error("missing file id")
				return hookResponseBadRequest()
			}

			file, err := svc.dataService.GetFile(tenant.ID, fileId)
			if err != nil || file == nil {
				svc.logger.Error("file does not exist")
				return hookResponseBadRequest()
			}

			key := req.Event.Upload.Storage["Key"]
			if key == "" {
				svc.logger.Error("missing storage key")
				return hookResponseBadRequest()
			}

			newKey := fmt.Sprintf("%s/%s.mp3", tenant.ID, file.ID)

			err = svc.storageService.MoveFile(key, newKey, "audio/mpeg")
			if err != nil {
				svc.logger.Error("failed to move file", zap.Error(err))
				return hooksResponseInternalServerError()
			}

			err = svc.storageService.DeleteFile(fmt.Sprintf("%s.info", key))
			if err != nil {
				svc.logger.Error("failed to delete .info file", zap.Error(err))
				return hooksResponseInternalServerError()
			}

			file.Active = true

			err = svc.dataService.UpdateFile(file)
			if err != nil {
				svc.logger.Error("failed to update file", zap.Error(err))
				return hooksResponseInternalServerError()
			}

			break
		}

	case "post-terminate":
		{
			fileId, exists := req.Event.Upload.MetaData["id"]
			if !exists || fileId == "" {
				return hookResponseBadRequest()
			}

			file, err := svc.dataService.GetFile(tenant.ID, fileId)
			if err != nil || file == nil {
				return hookResponseBadRequest()
			}

			file.Active = false
			file.Deleted = true

			err = svc.dataService.UpdateFile(file)
			if err != nil {
				return hooksResponseInternalServerError()
			}

			break
		}

	default:
		return &hooks.HookResponse{}
	}

	return &hooks.HookResponse{}
}

func NewHookHandlerService(logger *zap.Logger, dataService *DataService, storageService *StorageService) *HookHandlerService {

	return &HookHandlerService{
		logger:         logger,
		dataService:    dataService,
		storageService: storageService,
	}
}
