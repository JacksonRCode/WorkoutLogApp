//routes/workoutRouter.js
const { Router } = require("express");
import { protect } from "../middleware/authMiddleware";
import { compileWorkout } from "../controllers/workoutController";

const workoutRouter = Router();

workoutRouter.use(protect);

module.exports = workoutRouter;
