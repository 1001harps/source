import * as AWS from "@aws-sdk/client-s3";
import "dotenv/config";
import winston from "winston";
import { createDataSource } from "./db/data-source";
import { initServer } from "./server";
import {
  StorageConfigSchema,
  StorageService,
} from "./services/storage-service";
import {
  CloudFrontUrlSigningService,
  UrlSigningServiceConfigSchema,
} from "./services/url-signing-service";

const start = async () => {
  const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    level: "info",
  });

  const dataSource = createDataSource(
    process.env.POSTGRES_HOST!,
    process.env.POSTGRES_USER!,
    process.env.POSTGRES_PASSWORD!
  );

  await dataSource.initialize();
  await dataSource.synchronize();

  const s3Client = new AWS.S3({ region: process.env.AWS_REGION });

  const storageConfig = {
    bucket: process.env.AWS_S3_BUCKET,
  };

  const urlSigningConfig = {
    baseUrl: process.env.CLOUDFRONT_BASE_URL,
    keyPairId: process.env.CLOUDFRONT_KEYPAIR_ID,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
  };

  const signingService = new CloudFrontUrlSigningService(
    UrlSigningServiceConfigSchema.parse(urlSigningConfig)
  );

  const storageService = new StorageService(
    s3Client,
    signingService,
    StorageConfigSchema.parse(storageConfig)
  );

  const deps = {
    logger,
    dataSource,
    storageService,
  };

  const port = process.env.PORT;

  const server = initServer(deps);
  server.listen(port, () =>
    logger.info(`[server]: Server is running at http://localhost:${port}`)
  );
};

start();
