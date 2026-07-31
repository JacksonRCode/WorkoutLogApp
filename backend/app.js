// app.js
const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/apiRouter");
import { handleError } from "./middleware/errorMiddleware";
import { NotFoundError } from "./errors/NotFoundError";
const config = require("./config");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "WorkoutLogApp API",
    version: "1.0.0",
    environment: config.server.environment,
  });
});
app.use("/api", apiRouter);

app.use((_, next) => {
  next(new NotFoundError("Route not found"));
});

app.use(handleError);

module.exports = app;
