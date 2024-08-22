export interface AppLocals {
  apiKey: string;
  tenantId: string;
}

export interface UploadedFile {
  name: string;
  data: Uint8Array;
  size: number;
  encoding: string;
  tempFilePath: string;
  truncated: boolean;
  mimetype: string;
  md5: string;
}
