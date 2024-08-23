import { DataSource, Repository } from "typeorm";
import { File } from "../db/entity/File";
import { Tenant } from "../db/entity/Tenant";
import { Logger } from "winston";
import { Guard } from "../guard";

export interface FileDto {
  id: string;
  created: Date;
  path: string;
  url?: string;
}

const fileMapper = (file: File): FileDto => {
  return { id: file.id, created: file.created, path: file.path() };
};

export interface DataService {
  getFile(tenantId: string, fileId: string): Promise<FileDto>;
  setFileInactive(tenantId: string, fileId: string): Promise<void>;
  deleteFile(tenantId: string, fileId: string): Promise<void>;
  getFiles(tenantId: string): Promise<FileDto[]>;
  createFile(tenantId: string): Promise<FileDto>;
  getTenantByApiKey(apiKey: string): Promise<Tenant>;
  getInactiveFiles(): Promise<File[]>;
}

export class DbDataService implements DataService {
  logger: Logger;
  fileRepository: Repository<File>;
  tenantRepository: Repository<Tenant>;

  constructor(logger: Logger, dataSource: DataSource) {
    this.logger = logger;
    this.fileRepository = dataSource.getRepository(File);
    this.tenantRepository = dataSource.getRepository(Tenant);
  }

  async getFile(tenantId: string, fileId: string): Promise<FileDto> {
    Guard.isDefined("tenantId", tenantId);
    Guard.isDefined("fileId", fileId);

    if (fileId === undefined) throw "no file id";

    const file = await this.fileRepository.findOneBy({
      tenantId,
      id: fileId,
      active: true,
    });

    return fileMapper(file);
  }

  async setFileInactive(tenantId: string, fileId: string): Promise<void> {
    const file = await this.fileRepository.findOneBy({ tenantId, id: fileId });

    file.active = false;

    await this.fileRepository.save(file);
  }

  async deleteFile(tenantId: string, fileId: string): Promise<void> {
    await this.fileRepository.delete({ tenantId, id: fileId });
  }

  async getFiles(tenantId: string): Promise<FileDto[]> {
    const files = await this.fileRepository.findBy({ tenantId, active: true });
    return files.map(fileMapper);
  }

  async createFile(tenantId: string): Promise<FileDto> {
    const file = this.fileRepository.create({ tenantId });

    await this.fileRepository.save(file);

    return fileMapper(file);
  }

  async getTenantByApiKey(apiKey: string): Promise<Tenant> {
    try {
      const tenant = this.tenantRepository.findOneBy({ apiKey });
      return tenant;
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

  async getInactiveFiles() {
    const files = await this.fileRepository.findBy({ active: false });
    return files;
  }

  async deleteInactiveFiles() {
    const files = await this.fileRepository.findBy({ active: false });
    await this.fileRepository.remove(files);
  }
}
