import { DataSource } from "typeorm";
import { File } from "./entity/File";
import { Tenant } from "./entity/Tenant";

export const createDataSource = (url: string) => {
  return new DataSource({
    type: "postgres",
    url,
    synchronize: true,
    logging: false,
    entities: [File, Tenant],
    migrations: [],
    subscribers: [],
  });
};
