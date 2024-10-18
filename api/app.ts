import * as AWS from "@aws-sdk/client-s3";
import "dotenv/config";
import winston from "winston";
import { createDataSource } from "./db/data-source";
import { initServer } from "./server";
import { S3UrlSigningService } from "./services/url-signing-service";

const start = async () => {
  const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    level: "info",
  });

  const dataSource = createDataSource(process.env.POSTGRES_CONNECTION_STRING!);

  await dataSource.initialize();
  await dataSource.synchronize();

  const s3Client = new AWS.S3({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_S3_ENDPOINT,
  });

  const urlSigningService = new S3UrlSigningService(
    s3Client,
    process.env.AWS_S3_BUCKET!
  );

  const deps = {
    logger,
    dataSource,
    urlSigningService,
  };

  const port = process.env.PORT;

  const server = initServer(deps);
  server.listen(port, () =>
    logger.info(`[server]: Server is running at http://localhost:${port}`)
  );
};

start();
