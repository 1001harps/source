import { IncomingMessage, ServerResponse } from "http";
import { Upload } from "@tus/server";
import { Logger } from "winston";
import { DataSource } from "typeorm";
import * as AWS from "@aws-sdk/client-s3";
import { Tenant, File } from "../db/entity";

export class UploadHandlerService {
  logger: Logger;
  dataSource: DataSource;
  s3Client: AWS.S3;

  constructor(logger: Logger, dataSource: DataSource, s3Client: AWS.S3) {
    this.logger = logger;
    this.dataSource = dataSource;
    this.s3Client = s3Client;
  }

  async uploadCreate(
    req: IncomingMessage,
    res: ServerResponse,
    upload: Upload
  ) {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || typeof apiKey !== "string") {
      res.statusCode = 401;
      throw "no api key";
    }

    const tenantRepository = this.dataSource.getRepository(Tenant);
    const tenant = await tenantRepository.findOneBy({ apiKey });
    if (!tenant) {
      res.statusCode = 401;
      throw "invalid api key";
    }

    const fileRepository = this.dataSource.getRepository(File);
    const file = fileRepository.create();
    file.id = upload.id;
    file.tenantId = tenant.id;
    await file.save();

    return {
      res,
      metadata: { ...upload.metadata, id: file.id },
    };
  }

  async postFinish(req: IncomingMessage, res: ServerResponse, upload: Upload) {
    console.log("POST_FINISH");

    const apiKey = req.headers["x-api-key"];
    if (!apiKey || typeof apiKey !== "string") {
      res.statusCode = 401;
      throw "no api key";
    }

    const tenantRepository = this.dataSource.getRepository(Tenant);
    const tenant = await tenantRepository.findOneBy({ apiKey });
    if (!tenant) {
      res.statusCode = 401;
      throw "invalid api key";
    }

    const fileId = upload.metadata?.["id"];
    if (!fileId) {
      res.statusCode = 400;
      throw "";
    }

    const fileRepository = this.dataSource.getRepository(File);
    const file = await fileRepository.findOneBy({
      tenantId: tenant.id,
      id: fileId,
    });

    if (!file) {
      res.statusCode = 400;
      throw "file does not exist";
    }

    const key = upload.storage?.path;
    if (!key) {
      res.statusCode = 400;
      throw "no key";
    }

    const newKey = `${tenant.id}/${file.id}.mp3`;

    console.log({
      upload,
      key: `${process.env.AWS_S3_BUCKET!}/${key}`,
      newKey,
    });

    // TODO: lots of error handling skipped here

    await this.s3Client.copyObject({
      Bucket: process.env.AWS_S3_BUCKET!,
      CopySource: `${process.env.AWS_S3_BUCKET!}/${key}`,
      Key: newKey,
      ContentType: "audio/mpeg",
    });

    await this.s3Client.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    });

    await this.s3Client.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: `${key}.info`,
    });

    file.active = true;
    await file.save();

    console.log("POST_FINISH complete");
  }

  async postTerminate(
    req: IncomingMessage,
    res: ServerResponse,
    upload: Upload
  ) {
    console.log("POST_TERMINATE");

    const apiKey = req.headers["x-api-key"];
    if (!apiKey || typeof apiKey !== "string") {
      res.statusCode = 401;
      throw "no api key";
    }

    const tenantRepository = this.dataSource.getRepository(Tenant);
    const tenant = await tenantRepository.findOneBy({ apiKey });
    if (!tenant) {
      res.statusCode = 401;
      throw "invalid api key";
    }

    const fileId = upload.metadata?.["id"];
    if (!fileId) {
      res.statusCode = 400;
      throw "";
    }

    const fileRepository = this.dataSource.getRepository(File);
    const file = await fileRepository.findOneBy({
      tenantId: tenant.id,
      id: fileId,
    });

    if (!file) {
      res.statusCode = 400;
      throw "file does not exist";
    }

    file.active = false;
    file.deleted = true;
    file.uploadError = true;

    await file.save();

    console.log("POST_TERMINATE complete");
  }
}
