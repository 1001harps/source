import { Request, Response } from "express";
import { Dependencies } from "../../../types";
import { File } from "../../../db/entity/File";

export const deleteFileHandler =
  ({ dataSource }: Dependencies) =>
  async (req: Request, res: Response) => {
    const tenantId = res.locals.tenantId;
    const fileId = req.params.id;

    if (!fileId) {
      res.sendStatus(400);
      return;
    }

    const fileRepository = dataSource.getRepository(File);

    const file = await fileRepository.findOneBy({ tenantId, id: fileId });
    if (!file) {
      res.sendStatus(404);
      return;
    }

    file.deleted = true;
    await fileRepository.save(file);

    res.sendStatus(200);
  };
