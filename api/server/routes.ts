import { Request, Response } from "express";
import { Dependencies } from "../types";
import { AppLocals, UploadedFile } from "./types";
import { Guard } from "../guard";

export const getFileHandler =
  ({ dataService, storageService, logger }: Dependencies) =>
  async (req: Request, res: Response) => {
    const tenantId = res.locals.tenantId;
    const fileId = req.params.id;

    try {
      Guard.isDefined("fileId", fileId);
      Guard.isUuid("value", fileId);
    } catch (e) {
      res.status(400).send("file id required");
      return;
    }

    const file = await dataService.getFile(tenantId, fileId);
    const url = await storageService.getUrl(file.path);

    file.url = url;

    res.json(file);
  };

export const deleteFileHandler =
  ({ dataService }: Dependencies) =>
  async (req: Request, res: Response) => {
    const tenantId = res.locals.tenantId;
    const fileId = req.params.id;

    if (!fileId) {
      res.sendStatus(400);
      res.end();
      return;
    }

    await dataService.setFileInactive(tenantId, fileId);

    res.status(200);
    res.end();
  };

export const getFilesHandler =
  ({ dataService, storageService }: Dependencies) =>
  async (req: Request, res: Response) => {
    const tenantId = res.locals.tenantId;

    const files = await dataService.getFiles(tenantId);

    const paths = files.map((f) => f.path);
    if (paths.length === 0) {
      res.json(files);
      return;
    }

    const urls = await storageService.getUrls(paths);

    const filesWithUrl = files.map((f) => ({
      ...f,
      url: urls[f.path],
    }));

    res.json(filesWithUrl);
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

      res.json(file);
    } catch (e) {
      logger.error(e);
      res.sendStatus(500);
    }

    res.end();
  };
