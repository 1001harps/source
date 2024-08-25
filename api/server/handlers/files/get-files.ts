import { Request, Response } from "express";
import { File } from "../../../db/entity/File";
import { Dependencies } from "../../../types";
import { fileMapper } from "./types";

export const getFilesHandler =
  ({ dataSource, storageService }: Dependencies) =>
  async (req: Request, res: Response) => {
    const tenantId = res.locals.tenantId;

    const fileRepository = dataSource.getRepository(File);
    const files = await fileRepository.findBy({
      tenantId,
      active: true,
      deleted: false,
    });

    const dtos = files.map(fileMapper);

    const expiry = new Date(Date.now() + 1000 * 60);

    // TODO: is there a way to sign in bulk?
    for (const dto of dtos) {
      dto.url = await storageService.getUrl(dto.path, expiry);
    }

    res.json(dtos);
  };
