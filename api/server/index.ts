import cors, { CorsOptions } from "cors";
import express from "express";
import expressWinston from "express-winston";
import winston from "winston";
import { Dependencies } from "../types";
import {
  deleteFileHandler,
  getFileHandler,
  getFilesHandler,
} from "./handlers/files";
import { apiKeyMiddleware } from "./middleware/api-key-middleware";
import { EVENTS, Server } from "@tus/server";
import { randomUUID } from "crypto";

export const initServer = (deps: Dependencies) => {
  const app = express();

  const uploadApp = express();

  const server = new Server({
    path: "/uploads",
    datastore: deps.tusS3Store,
    namingFunction: () => randomUUID(),
    onUploadCreate: deps.uploadHandlerService.uploadCreate,
  });

  server.on(EVENTS.POST_FINISH, deps.uploadHandlerService.postFinish);
  server.on(EVENTS.POST_TERMINATE, deps.uploadHandlerService.postTerminate);

  uploadApp.all("*", server.handle.bind(server));

  const corsOptions: CorsOptions = {
    origin: "*",
    allowedHeaders: [
      "X-API-KEY",
      "tus-resumable",
      "upload-length",
      "upload-offset",
      "content-type",
    ],
  };

  app.use(express.json());

  app.use(cors(corsOptions));
  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(winston.format.json()),
    })
  );

  app.use(apiKeyMiddleware(deps));

  app.options("*", cors());

  app.use("/uploads", uploadApp);
  app.get("/files/:id", getFileHandler(deps));
  app.delete("/files/:id", deleteFileHandler(deps));
  app.get("/files", getFilesHandler(deps));

  return app;
};
