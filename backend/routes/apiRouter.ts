import { Router } from "express";
import userRouter from "./userRouter";
import programRouter from "./programRouter";
import workoutRouter from "./workoutRouter";

const root = Router();

root.use("/user", userRouter);
root.use("/programs", programRouter);
root.use("/workouts", workoutRouter);

export default root;
