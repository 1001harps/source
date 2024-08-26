package server

import (
	"context"
	"fmt"

	pb "github.com/1001harps/source/upload-api/pkg/hooks/grpc/proto"
	"github.com/1001harps/source/upload-api/pkg/service"
	"go.uber.org/zap"
)

var hookResponseOk = func(fileInfo pb.FileInfoChanges) *pb.HookResponse {
	return &pb.HookResponse{
		HttpResponse: &pb.HTTPResponse{
			StatusCode: 200,
		},

		ChangeFileInfo: &fileInfo,
	}
}

var hookResponseBadRequest = func() *pb.HookResponse {
	return &pb.HookResponse{
		HttpResponse: &pb.HTTPResponse{
			StatusCode: 400,
		},
	}
}

var hookResponseForbidden = func() *pb.HookResponse {
	return &pb.HookResponse{
		HttpResponse: &pb.HTTPResponse{
			StatusCode: 403,
		},
		RejectUpload: true,
	}
}

var hooksResponseInternalServerError = func() *pb.HookResponse {
	return &pb.HookResponse{
		HttpResponse: &pb.HTTPResponse{
			StatusCode: 500,
		},
	}
}

type hookHandlerServer struct {
	pb.UnimplementedHookHandlerServer

	logger         *zap.Logger
	dataService    *service.DataService
	storageService *service.StorageService
}

func (svc *hookHandlerServer) InvokeHook(ctx context.Context, req *pb.HookRequest) (*pb.HookResponse, error) {
	fmt.Printf("req: %s\n", req.Type)

	apiKey, exists := req.Event.HttpRequest.Header["X-Api-Key"]

	if !exists || apiKey == "" {
		svc.logger.Error("missing api key")
		return hookResponseForbidden(), nil
	}

	// ensure tenant exists
	tenant, err := svc.dataService.GetTenantByAPIKey(apiKey)
	if err != nil {
		svc.logger.Error("tenant not found")
		return hookResponseForbidden(), nil
	}

	if !tenant.Active {
		svc.logger.Error("tenant not active")
		return hookResponseForbidden(), nil
	}

	switch req.Type {
	case "pre-create":
		file, err := svc.dataService.CreateFile(tenant.ID)
		if err != nil {
			return hooksResponseInternalServerError(), nil
		}

		fileInfo := pb.FileInfoChanges{
			Id: file.ID,
			MetaData: map[string]string{
				"id": file.ID,
			},
		}

		return hookResponseOk(fileInfo), nil

	case "post-finish":
		{
			fileId, exists := req.Event.Upload.MetaData["id"]
			if !exists || fileId == "" {
				return hookResponseBadRequest(), nil
			}

			file, err := svc.dataService.GetFile(tenant.ID, fileId)
			if err != nil || file == nil {
				return hookResponseBadRequest(), nil
			}

			key := req.Event.Upload.Storage["Key"]
			if key == "" {
				return hookResponseBadRequest(), nil
			}

			newKey := fmt.Sprintf("%s/%s.mp3", tenant.ID, file.ID)

			err = svc.storageService.MoveFile(key, newKey)
			if err != nil {
				return hooksResponseInternalServerError(), nil
			}

			file.Active = true

			err = svc.dataService.UpdateFile(file)
			if err != nil {
				return hooksResponseInternalServerError(), nil
			}

			break
		}

	case "post-terminate":
		{
			fileId, exists := req.Event.Upload.MetaData["id"]
			if !exists || fileId == "" {
				return hookResponseBadRequest(), nil
			}

			file, err := svc.dataService.GetFile(tenant.ID, fileId)
			if err != nil || file == nil {
				return hookResponseBadRequest(), nil
			}

			file.Active = false
			file.Deleted = true

			err = svc.dataService.UpdateFile(file)
			if err != nil {
				return hooksResponseInternalServerError(), nil
			}

			break
		}

	default:
		return &pb.HookResponse{}, nil
	}

	return &pb.HookResponse{}, nil
}

func NewServer(logger *zap.Logger, dataService *service.DataService, storageService *service.StorageService) *hookHandlerServer {

	return &hookHandlerServer{
		logger:         logger,
		dataService:    dataService,
		storageService: storageService,
	}
}
