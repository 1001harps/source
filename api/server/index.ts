import express from "express";
import { Dependencies } from "../types";
import {
  deleteFileHandler,
  getFileHandler,
  getFilesHandler,
} from "./handlers/files";
import { postTusdWebhook } from "./handlers/internal/tusd";
import cors, { CorsOptions } from "cors";
import expressWinston from "express-winston";
import winston from "winston";
import { apiKeyMiddleware } from "./middleware/api-key-middleware";

export const initServer = (deps: Dependencies) => {
  const app = express();

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
  app.post("/internal/tusd/webhook", postTusdWebhook(deps));

  app.use(apiKeyMiddleware(deps));

  app.options("*", cors());

  app.get("/files/:id", getFileHandler(deps));
  app.delete("/files/:id", deleteFileHandler(deps));
  app.get("/files", getFilesHandler(deps));

  return app;
};
