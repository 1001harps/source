import * as AWS from "@aws-sdk/client-s3";
import { z } from "zod";
import { UrlSigningService } from "./url-signing-service";

export const StorageConfigSchema = z.object({
  bucket: z.string(),
});

export type StorageConfig = z.infer<typeof StorageConfigSchema>;

export class StorageService {
  config: StorageConfig;
  client: AWS.S3;
  urlSigningService: UrlSigningService;

  constructor(
    client: AWS.S3,
    urlSigningService: UrlSigningService,
    config: StorageConfig
  ) {
    this.client = client;
    this.urlSigningService = urlSigningService;
    this.config = config;
  }

  async getUrl(path: string, expires: Date): Promise<string> {
    return this.urlSigningService.getUrl(path, expires);
  }

  async move(path: string, newPath: string): Promise<void> {
    await this.client.copyObject({
      Bucket: this.config.bucket,
      CopySource: `${this.config.bucket}/${path}`,
      Key: newPath,
    });

    await this.client.deleteObject({
      Bucket: this.config.bucket,
      Key: path,
    });
  }
}
