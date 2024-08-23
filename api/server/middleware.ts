import { NextFunction, Request, Response } from "express";
import { Dependencies } from "../types";
import { AppLocals } from "./types";

export const apiKeyMiddleware =
  ({ dataService }: Dependencies) =>
  async (req: Request, res: Response<any, AppLocals>, next: NextFunction) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || typeof apiKey !== "string") {
      res.sendStatus(401);
      return;
    }

    const tenant = await dataService.getTenantByApiKey(apiKey);

    if (!tenant) {
      res.sendStatus(403);
      return;
    }

    res.locals.apiKey = apiKey;
    res.locals.tenantId = tenant.id;

    next();
  };
