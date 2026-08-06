import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { programSchema } from "../validation/programSchemas";
import {
  removeWorkout,
  getWorkouts,
  getExercises,
  retrievePrograms,
  makeProgram,
  removeProgram,
} from "../controllers/programController";

const programRouter = Router();

programRouter.use(protect);

programRouter.get("/", retrievePrograms);
programRouter.post("/create", validateRequest(programSchema), makeProgram);
programRouter.delete("/:id", removeProgram);
programRouter.get("/:id/workouts", getWorkouts);
programRouter.get("/:id/workouts/:workout_id", getExercises);
// programRouter.post("/:id/workouts", addWorkout);
programRouter.delete("/:id/workouts/:workout_id", removeWorkout);

export default programRouter;
