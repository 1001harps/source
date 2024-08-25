import * as AWS from "@aws-sdk/client-s3";
import { DataSource } from "typeorm";
import { Logger } from "winston";
import { StorageService } from "./services/storage-service";

export interface Dependencies {
  logger: Logger;
  dataSource: DataSource;
  storageService: StorageService;
}
