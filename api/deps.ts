import * as AWS from "@aws-sdk/client-s3";
import { S3Store } from "@tus/s3-store";
import "dotenv/config";
import winston from "winston";
import { createDataSource } from "./db/data-source";
import { UploadHandlerService } from "./services/upload-handler-service";
import { S3UrlSigningService } from "./services/url-signing-service";
import { Dependencies } from "./types";

export const initDependencies = async (): Promise<Dependencies> => {
  const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    level: "info",
  });

  const dataSource = createDataSource(process.env.POSTGRES_CONNECTION_STRING!);

  await dataSource.initialize();
  await dataSource.synchronize();

  const s3Config: AWS.S3ClientConfig = {
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  };

  const s3Client = new AWS.S3(s3Config);
  const tusS3Store = new S3Store({
    partSize: 8 * 1024 * 1024,
    s3ClientConfig: {
      ...s3Config,
      bucket: process.env.AWS_S3_BUCKET!,
    },
  });

  const uploadHandlerService = new UploadHandlerService(
    logger,
    dataSource,
    s3Client
  );

  const urlSigningService = new S3UrlSigningService(
    s3Client,
    process.env.AWS_S3_BUCKET!
  );

  return {
    logger,
    dataSource,
    urlSigningService,
    s3Client,
    uploadHandlerService,
    tusS3Store,
  };
};
