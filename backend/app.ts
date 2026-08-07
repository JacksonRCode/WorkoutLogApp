import express from "express";
import cors from "cors";
import apiRouter from "./routes/apiRouter";
import requestLogger from "./logging/requestLogger";
import { handleError } from "./middleware/errorMiddleware";
import { NotFoundError } from "./errors/NotFoundError";
import { config } from "./config";

const app = express();

app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "WorkoutLogApp API",
    version: "1.0.0",
    environment: config.server.environment,
  });
});
app.use("/api", apiRouter);

app.use((_req, _res, next) => {
  next(new NotFoundError("Route not found"));
});

app.use(handleError);

export { app };
