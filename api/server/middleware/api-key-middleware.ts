import { NextFunction, Request, Response } from "express";
import { Dependencies } from "../../types";
import { AppLocals } from "../types";
import { Tenant } from "../../db/entity";

export const apiKeyMiddleware =
  ({ dataSource }: Dependencies) =>
  async (req: Request, res: Response<any, AppLocals>, next: NextFunction) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || typeof apiKey !== "string") {
      res.sendStatus(401);
      return;
    }

    const tenantRepository = dataSource.getRepository(Tenant);
    const tenant = await tenantRepository.findOneBy({ apiKey, active: true });
    if (!tenant) {
      res.sendStatus(403);
      return;
    }

    res.locals.apiKey = apiKey;
    res.locals.tenantId = tenant.id;

    next();
  };
