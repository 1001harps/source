import { Request, Response } from "express";
import { File } from "../../../db/entity/File";
import { Dependencies } from "../../../types";
import { fileMapper } from "./types";

export const getFileHandler =
  ({ dataSource, urlSigningService }: Dependencies) =>
  async (req: Request, res: Response) => {
    const tenantId = res.locals.tenantId;
    const fileId = req.params.id;

    if (!fileId) {
      res.status(400).send("file id required");
      return;
    }

    const fileRepository = dataSource.getRepository(File);
    const file = await fileRepository.findOneBy({
      tenantId,
      id: fileId,
      active: true,
      deleted: false,
    });

    if (!file) {
      res.sendStatus(404);
      return;
    }

    const expiry = new Date(Date.now() + 1000 * 60);
    const url = await urlSigningService.getUrl(file.path(), expiry);

    const dto = fileMapper(file);
    dto.url = url;

    res.json(file);
  };
