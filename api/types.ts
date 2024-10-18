import * as AWS from "@aws-sdk/client-s3";
import { DataSource } from "typeorm";
import { Logger } from "winston";
import { UrlSigningService } from "./services/url-signing-service";

export interface Dependencies {
  logger: Logger;
  dataSource: DataSource;
  urlSigningService: UrlSigningService;
}
