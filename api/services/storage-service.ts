import * as AWS from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { z } from "zod";

export const StorageConfigSchema = z.object({
  bucket: z.string(),
  cloudfront: z.object({
    baseUrl: z.string(),
    keyPairId: z.string(),
    privateKey: z.string(),
  }),
});

export type StorageConfig = z.infer<typeof StorageConfigSchema>;

export class StorageService {
  config: StorageConfig;
  client: AWS.S3;

  constructor(client: AWS.S3, config: StorageConfig) {
    this.client = client;
    this.config = config;
  }

  async getUrl(path: string, expires: Date): Promise<string> {
    const { baseUrl, keyPairId, privateKey } = this.config.cloudfront;
    // "2026-01-01",

    const url = `${baseUrl}/${path}`;

    const dateLessThan = expires.toString();

    const signedUrl = getSignedUrl({
      keyPairId,
      privateKey,
      url,
      dateLessThan,
    });

    return signedUrl;
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
