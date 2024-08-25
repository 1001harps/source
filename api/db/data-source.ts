import { DataSource } from "typeorm";
import { File, Tenant } from "./entity";

export const createDataSource = (
  host: string,
  username: string,
  password: string
) => {
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
