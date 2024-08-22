import { DataSource, Repository } from "typeorm";
import { File } from "../db/entity/File";
import { Tenant } from "../db/entity/Tenant";
import { Logger } from "winston";

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
  getFiles(tenantId: string): Promise<FileDto[]>;
  createFile(tenantId: string): Promise<FileDto>;
  getTenantByApiKey(apiKey: string): Promise<Tenant>;
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

  async getFiles(tenantId: string): Promise<FileDto[]> {
    const files = await this.fileRepository.findBy({ tenantId });
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
}
