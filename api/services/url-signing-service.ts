import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { z } from "zod";

export interface UrlSigningService {
  getUrl(path: string, expires: Date): Promise<string>;
}

export const UrlSigningServiceConfigSchema = z.object({
  baseUrl: z.string(),
  keyPairId: z.string(),
  privateKey: z.string(),
});

export type UrlSigningServiceConfig = z.infer<
  typeof UrlSigningServiceConfigSchema
>;

export class CloudFrontUrlSigningService implements UrlSigningService {
  config: UrlSigningServiceConfig;

  constructor(config: UrlSigningServiceConfig) {
    this.config = config;
  }

  async getUrl(path: string, expires: Date): Promise<string> {
    const { baseUrl, keyPairId, privateKey } = this.config;
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
}
