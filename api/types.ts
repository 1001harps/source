import { DataService } from "./services/data-service";
import { StorageService } from "./services/storage-service";
import { Logger } from "winston";

export interface Dependencies {
  logger: Logger;
  dataService: DataService;
  storageService: StorageService;
}
