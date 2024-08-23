import "dotenv/config";
import express, { Express } from "express";
import fileUpload from "express-fileupload";
import winston from "winston";
import { createDataSource } from "./db/data-source";
import { apiKeyMiddleware } from "./server/middleware";
import {
  deleteFileHandler,
  getFileHandler,
  getFilesHandler,
  putFileHandler,
} from "./server/routes";
import { DbDataService } from "./services/data-service";
import { SuperbaseStorageService } from "./services/storage-service";
import cors, { CorsOptions } from "cors";
import expressWinston from "express-winston";
import { Dependencies } from "./types";

// TEMP: this should be its own app
const startCleanupJob = ({
  dataService,
  storageService,
  logger,
}: Dependencies) => {
  setInterval(async () => {
    logger.info("running cleanup job");
    const inactiveFiles = await dataService.getInactiveFiles();

    for (const file of inactiveFiles) {
      try {
        await storageService.delete(file.path());
        await dataService.deleteFile(file.tenantId, file.id);
        logger.info("deleted file", { path: file.path() });
      } catch (e) {
        logger.error("failed to delete file", { error: e });
      }
    }
  }, 10000);
};

const start = async () => {
  const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    level: "info",
  });

  const dataSource = createDataSource(process.env.DB_CONNECTION_STRING);
  await dataSource.initialize();
  await dataSource.synchronize();

  const dataService = new DbDataService(logger, dataSource);
  const storageService = new SuperbaseStorageService();
  const deps = { logger, dataService, storageService };

  startCleanupJob(deps);

  const app: Express = express();
  const port = process.env.PORT;

  const corsOptions: CorsOptions = {
    origin: "*",
    allowedHeaders: "X-API-KEY",
  };

  app.use(express.json());

  app.use(cors(corsOptions));
  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(winston.format.json()),
    })
  );

  app.use(fileUpload());
  app.use(apiKeyMiddleware(deps));

  // routes
  app.options("*", cors());
  app.get("/file/:id", getFileHandler(deps));
  app.delete("/file/:id", deleteFileHandler(deps));
  app.put("/file", putFileHandler(deps));
  app.get("/files", getFilesHandler(deps));

  app.listen(port, () =>
    logger.info(`[server]: Server is running at http://localhost:${port}`)
  );
};

start();
