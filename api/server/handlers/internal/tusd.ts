import { Request, Response } from "express";
import { File, Tenant } from "../../../db/entity";
import { Dependencies } from "../../../types";
import { AppLocals } from "../../types";
import { HookRequest, HookResponse } from "./tusd-types";

const hookResponseOk = (
  extraData: Partial<HookResponse> = {}
): HookResponse => {
  return {
    HTTPResponse: {
      statusCode: 200,
    },
    ...extraData,
  };
};

const hookResponseBadRequest = (): HookResponse => {
  return {
    HTTPResponse: {
      statusCode: 400,
    },
  };
};

const hookResponseForbidden = (): HookResponse => {
  return {
    HTTPResponse: {
      statusCode: 403,
    },
    RejectUpload: true,
  };
};

const getApiKey = (request: HookRequest) => {
  return request.Event.HTTPRequest.Header["X-Api-Key"]
    ? request.Event.HTTPRequest.Header["X-Api-Key"][0]
    : null;
};

export const postTusdWebhook =
  ({ storageService, logger, dataSource }: Dependencies) =>
  async (req: Request, res: Response<any, AppLocals>) => {
    const hookRequest: HookRequest = req.body;
    logger.info(`tusd webhook: ${hookRequest.Type}`);

    // ensure request has api key
    const apiKey = getApiKey(hookRequest);
    if (!apiKey) {
      res.json(hookResponseForbidden());
      return;
    }

    // ensure tenant exists
    const tenantRepository = dataSource.getRepository(Tenant);
    const tenant = await tenantRepository.findOneBy({ apiKey });
    if (!tenant) {
      res.json(hookResponseForbidden());
      return;
    }

    switch (hookRequest.Type) {
      case "pre-create": {
        const fileRepository = dataSource.getRepository(File);

        const file = fileRepository.create();
        file.tenantId = tenant.id;
        await fileRepository.save(file);

        const fileInfo = {
          ID: file.id,
          MetaData: {
            id: file.id,
          },
        };

        res.json(hookResponseOk({ ChangeFileInfo: fileInfo }));
        return;
      }

      case "post-finish": {
        const fileId = hookRequest.Event.Upload.MetaData.id;

        const fileRepository = dataSource.getRepository(File);
        const file = await fileRepository.findOneBy({
          tenantId: tenant.id,
          id: fileId,
        });

        if (!file) {
          res.json(hookResponseBadRequest());
          return;
        }

        await storageService.move(
          hookRequest.Event.Upload.Storage?.Key as string,
          `${tenant.id}/${file.id}.mp3`
        );

        file.active = true;
        await file.save();

        break;
      }

      case "post-terminate": {
        const fileId = hookRequest.Event.Upload.MetaData.id;

        const fileRepository = dataSource.getRepository(File);
        const file = await fileRepository.findOneBy({
          tenantId: tenant.id,
          id: fileId,
        });

        if (!file) {
          res.json(hookResponseOk());
          return;
        }

        file.active = false;
        file.deleted = true;

        await file.save();

        break;
      }

      case "post-create":
      case "post-receive":
      case "pre-finish":
        res.json(hookResponseOk());
        break;
    }
  };
