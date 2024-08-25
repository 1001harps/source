import { DataSource } from "typeorm";
import { File } from "./entity/File";
import { Tenant } from "./entity/Tenant";

export const createDataSource = (host: string, username: string, password) => {
  return new DataSource({
    type: "postgres",
    host,
    port: 5432,
    username,
    password,
    database: "source",
    synchronize: true,
    logging: false,
    entities: [File, Tenant],
    migrations: [],
    subscribers: [],
  });
};
