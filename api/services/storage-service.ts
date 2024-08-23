import { StorageClient } from "@supabase/storage-js";

export interface StorageService {
  getUrl(path: string): Promise<string>;
  getUrls(paths: string[]): Promise<Record<string, string>>;
  upload(path: string, data: Uint8Array, contentType: string): Promise<void>;
  delete(path: string): Promise<void>;
}

export class SuperbaseStorageService implements StorageService {
  storageClient: StorageClient;

  constructor() {
    const { SB_STORAGE_URL, SB_SERVICE_KEY } = process.env;

    this.storageClient = new StorageClient(SB_STORAGE_URL, {
      apikey: SB_SERVICE_KEY,
      Authorization: `Bearer ${SB_SERVICE_KEY}`,
    });
  }

  async getUrl(path: string): Promise<string> {
    const { SB_FILE_BUCKET } = process.env;

    const { data, error } = await this.storageClient
      .from(SB_FILE_BUCKET)
      .createSignedUrl(path, 3600);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  }

  async getUrls(paths: string[]): Promise<Record<string, string>> {
    const { SB_FILE_BUCKET } = process.env;

    const { data, error } = await this.storageClient
      .from(SB_FILE_BUCKET)
      .createSignedUrls(paths, 3600);

    if (error) {
      throw error;
    }

    const urls = data.reduce((p, x) => ({ ...p, [x.path]: x.signedUrl }), {});

    return urls;
  }

  async upload(
    path: string,
    data: Uint8Array,
    contentType: string
  ): Promise<void> {
    const { SB_FILE_BUCKET } = process.env;

    const { error } = await this.storageClient
      .from(SB_FILE_BUCKET)
      .upload(path, data, { contentType });

    if (error) throw error;
  }

  async delete(path: string): Promise<void> {
    const { SB_FILE_BUCKET } = process.env;

    const { error } = await this.storageClient
      .from(SB_FILE_BUCKET)
      .remove([path]);

    if (error) throw error;
  }
}
