//routes/workoutRouter.js
const { Router } = require("express");
import { protect } from "../middleware/authMiddleware";
const compileWorkout = require("../controllers/workoutController.js");

const workoutRouter = Router();

workoutRouter.use(protect);

workoutRouter.post("/create", compileWorkout);

module.exports = workoutRouter;
