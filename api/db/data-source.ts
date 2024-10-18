import { DataSource } from "typeorm";
import { File, Tenant } from "./entity";

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
