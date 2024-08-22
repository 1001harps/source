import { Request, Response } from "express";
import { Dependencies } from "../types";
import { AppLocals, UploadedFile } from "./types";

export const getFilesHandler =
  ({ dataService, storageService }: Dependencies) =>
  async (req: Request, res: Response) => {
    const tenantId = res.locals.tenantId;

    const files = await dataService.getFiles(tenantId);

    const paths = files.map((f) => f.path);

    const urls = await storageService.getUrls(paths);

    const result = files.map((f) => ({
      ...f,
      url: urls[f.path],
    }));

    res.setHeader("Content-Type", "application/json");
    res.json(result);
  };

export const putFileHandler =
  ({ dataService, storageService, logger }: Dependencies) =>
  async (req: Request, res: Response<any, AppLocals>) => {
    const tenantId = res.locals.tenantId;

    //@ts-ignore
    const uploadedFile = req.files.file as UploadedFile;
    if (!uploadedFile) {
      res.sendStatus(400);
      res.end();
      return;
    }

    try {
      const file = await dataService.createFile(tenantId);
      await storageService.upload(
        file.path,
        uploadedFile.data,
        uploadedFile.mimetype
      );
      logger.debug("uploaded", file.path);
    } catch (e) {
      logger.error(e);
      res.sendStatus(500);
      res.end();
      return;
    }
    res.sendStatus(200);
    return;
  };
