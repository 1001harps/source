import "dotenv/config";
import express, { Express } from "express";
import fileUpload from "express-fileupload";
import winston from "winston";
import { createDataSource } from "./db/data-source";
import { apiKeyMiddleware, requestLoggerMiddleware } from "./server/middleware";
import { getFilesHandler, putFileHandler } from "./server/routes";
import { DbDataService } from "./services/data-service";
import { SuperbaseStorageService } from "./services/storage-service";

const start = async () => {
  const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.simple(),
    level: "info",
  });

  const dataSource = createDataSource(process.env.DB_CONNECTION_STRING);
  await dataSource.initialize();
  await dataSource.synchronize();

  const dataService = new DbDataService(logger, dataSource);
  const storageService = new SuperbaseStorageService();
  const deps = { logger, dataService, storageService };
  const app: Express = express();
  const port = process.env.PORT;

  app.use(requestLoggerMiddleware(deps));
  app.use(fileUpload());
  app.use(apiKeyMiddleware(deps));
  app.put("/file", putFileHandler(deps));
  app.get("/files", getFilesHandler(deps));
  app.listen(port, () =>
    logger.info(`[server]: Server is running at http://localhost:${port}`)
  );
};

start();
