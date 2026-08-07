import { app } from "./app";
import { config } from "./config";
import logger from "./logging/logger";

app.listen(config.server.port, () => {
  logger.info(
    {
      port: config.server.port,
      environment: config.server.environment,
    },
    "Server started",
  );
});
