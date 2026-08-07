import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";
import logger from "./logger";

const requestLogger = pinoHttp({
  logger,

  genReqId: (_req, res) => {
    const requestId = randomUUID();

    res.setHeader("X-Request-Id", requestId);

    return requestId;
  },

  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return "error";
    } else if (res.statusCode >= 400) {
      return "warn";
    }
    return "info";
  },
});

export default requestLogger;
