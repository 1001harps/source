import * as AWS from "@aws-sdk/client-s3";
import { getSignedUrl as getSignedUrlCloudFront } from "@aws-sdk/cloudfront-signer";
import { z } from "zod";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface UrlSigningService {
  getUrl(path: string, expires: Date): Promise<string>;
}

export const CloudFrontUrlSigningServiceConfigSchema = z.object({
  baseUrl: z.string(),
  keyPairId: z.string(),
  privateKey: z.string(),
});

export type CloudFrontUrlSigningServiceConfig = z.infer<
  typeof CloudFrontUrlSigningServiceConfigSchema
>;

export class CloudFrontUrlSigningService implements UrlSigningService {
  config: CloudFrontUrlSigningServiceConfig;

  constructor(config: CloudFrontUrlSigningServiceConfig) {
    this.config = config;
  }

  async getUrl(path: string, expires: Date): Promise<string> {
    const { baseUrl, keyPairId, privateKey } = this.config;
    // "2026-01-01",

    const url = `${baseUrl}/${path}`;

    const dateLessThan = expires.toString();

    const signedUrl = getSignedUrlCloudFront({
      keyPairId,
      privateKey,
      url,
      dateLessThan,
    });

    return signedUrl;
  }
}

export class S3UrlSigningService implements UrlSigningService {
  client: AWS.S3;
  bucket: string;

  constructor(client: AWS.S3, bucket: string) {
    this.client = client;
    this.bucket = bucket;
  }

  async getUrl(path: string, expires: Date): Promise<string> {
    const command = new AWS.GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    // FIXME: use expires param
    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }
}
