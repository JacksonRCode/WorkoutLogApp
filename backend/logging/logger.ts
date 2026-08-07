import pino from "pino";
import { config } from "../config";

const env = config.server.environment;

let envLevel: string = "info";

if (env === "development") {
  envLevel = "debug";
} else if (env === "test") {
  envLevel = "silent";
}

const transport =
  env === "development"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined;

const logger = pino({
  name: "workout-api",
  level: envLevel,
  transport: transport,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
    ],
    censor: "[CLASSIFIED]",
  },
});

export default logger;
