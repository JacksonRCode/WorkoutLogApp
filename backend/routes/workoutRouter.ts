import { Router } from "express";
import { protect } from "../middleware/authMiddleware";

const workoutRouter = Router();

workoutRouter.use(protect);

export default workoutRouter;
