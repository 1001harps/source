import * as AWS from "@aws-sdk/client-s3";
import { DataSource } from "typeorm";
import { Logger } from "winston";
import { UrlSigningService } from "./services/url-signing-service";
import { UploadHandlerService } from "./services/upload-handler-service";
import { S3Store } from "@tus/s3-store";

export interface Dependencies {
  logger: Logger;
  dataSource: DataSource;
  urlSigningService: UrlSigningService;
  s3Client: AWS.S3;
  uploadHandlerService: UploadHandlerService;
  tusS3Store: S3Store;
}
