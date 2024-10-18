import "dotenv/config";
import { initServer } from "./server";
import { initDependencies } from "./deps";

const start = async () => {
  const port = process.env.PORT;

  const deps = await initDependencies();

  const server = initServer(deps);
  server.listen(port, () =>
    deps.logger.info(`[server]: Server is running at http://localhost:${port}`)
  );
};

start();
