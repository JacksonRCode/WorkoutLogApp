const express = require("express");
const root = express.Router();

const userRouter = require("./userRouter.js");
const programRouter = require("./programRouter.js");
const workoutRouter = require("./workoutRouter.js");

root.use("/user", userRouter);
root.use("/programs", programRouter);
root.use("/workouts", workoutRouter);

module.exports = root;
