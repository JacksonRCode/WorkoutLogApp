import { DatabaseError } from "pg";
import type { RequestHandler } from "express";
import type { PoolClient } from "pg";
import type { ValidatedProgramBody } from "../validation/programSchemas";
import { pool } from "../db/poolConnection";
import { BadRequestError } from "../errors/BadRequestError";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { createProgram, addProgramWorkout } from "../db/queries/inputQueries";
import {
  getPrograms,
  getProgramWorkouts,
  getWorkoutExercises,
  workoutExistsForProgram,
  programExistsForUser,
} from "../db/queries/retrievalQueries";
import {
  deleteProgram,
  removeProgramWorkout,
} from "../db/queries/deleteQueries";
import { compileWorkout } from "./workoutController";

type ProgramParam = { id: string };
type ProgramWorkoutParam = { id: string; workout_id: string };

const checkPos = (num: any) => {
  return Number.isSafeInteger(num) && num >= 0;
};

/**
 * Retrieves a user's programs.
 *
 * @returns response with user's programs.
 * Passes errors to express middleware.
 */
const retrievePrograms: RequestHandler = async (req, res, next) => {
  const user_id = req.user_id;

  if (user_id === undefined) {
    return next(new UnauthorizedError("User not found"));
  }

  try {
    const programs = await getPrograms(user_id);
    return res.status(200).json({ data: programs });
  } catch (err) {
    return next(err);
  }
};

/**
 * Adds workout to a program
 *
 * @returns nothing.
 * Propagates errors.
 */
const addWorkout = async (
  program_id: number,
  workout_id: number,
  client?: PoolClient,
): Promise<void> => {
  await addProgramWorkout(program_id, workout_id, client);
};

/**
 * Creates a program and links workouts to it.
 *
 * @returns Created program instance.
 * Passes errors to express middleware.
 */
const makeProgram: RequestHandler<
  Record<string, never>,
  unknown,
  ValidatedProgramBody
> = async (req, res, next) => {
  const user_id = req.user_id;
  const { name: programName, description, workouts } = req.body;

  const programDesc = description !== undefined ? description : null;

  if (user_id === undefined) {
    return next(new UnauthorizedError("User not found"));
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const inst = await createProgram(user_id, programName, programDesc, client);

    if (workouts.length > 0) {
      const workout_ids = await compileWorkout(user_id, workouts, client);
      for (const id of workout_ids) {
        await addWorkout(inst.program_id, id, client);
      }
    }

    await client.query("COMMIT");

    return res
      .status(201)
      .json({ message: "Program creation successful", data: inst });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err instanceof DatabaseError && err.code === "23505") {
      return next(new ConflictError("Program name already in use"));
    }
    return next(err);
  } finally {
    client.release();
  }
};

/**
 * Deletes program using programId and userId.
 *
 * @returns success message.and status
 * Passes error to express middleware.
 */
const removeProgram: RequestHandler<ProgramParam> = async (req, res, next) => {
  const user_id = req.user_id;
  const { id: program_id } = req.params;
  const programId = +program_id;

  if (user_id === undefined) {
    return next(new UnauthorizedError("User not found"));
  }

  if (!checkPos(programId)) {
    return next(new BadRequestError("Bad program request"));
  }

  try {
    const response = await deleteProgram(user_id, programId);
    if (!response) {
      return next(new NotFoundError("Program not found"));
    }
    return res.status(200).json({ message: "Program deleted" });
  } catch (err) {
    return next(err);
  }
};

/**
 * Removes a workout from a program.
 *
 * @returns success message and status.
 * Passes errors to express middleware.
 */
const removeWorkout: RequestHandler<ProgramWorkoutParam> = async (
  req,
  res,
  next,
) => {
  const { id: program_id, workout_id } = req.params;
  const programId = +program_id;
  const workoutId = +workout_id;

  if (!checkPos(programId) || !checkPos(workoutId)) {
    return next(new BadRequestError("Bad removal request"));
  }

  try {
    const response = await removeProgramWorkout(programId, workoutId);
    if (!response) {
      return next(new NotFoundError("Workout not found in program"));
    }
    return res.status(200).json({ message: "Workout deleted from program" });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves workouts from specified program.
 *
 * @returns 200 status and success message.
 * Passes errors to express middleware.
 */
const getWorkouts: RequestHandler<ProgramParam> = async (req, res, next) => {
  const user_id = req.user_id;
  const { id: program_id } = req.params;
  const programId = +program_id;

  if (user_id === undefined) {
    return next(new UnauthorizedError("User not found"));
  }

  if (!checkPos(programId)) {
    return next(new BadRequestError("Bad removal request"));
  }

  try {
    const programExists = await programExistsForUser(programId, user_id);
    if (!programExists) {
      return next(new NotFoundError("Program not found"));
    }

    const workouts = await getProgramWorkouts(programId);
    if (workouts.length === 0) {
      return res
        .status(200)
        .json({ message: "No workouts found for this program", data: [] });
    }
    return res
      .status(200)
      .json({ message: "Workouts successfully retrieved", data: workouts });
  } catch (err) {
    return next(err);
  }
};

/**
 * Retrieves exercises from a workout.
 *
 * @returns 200 status and exercises.
 * Passes errors to express middleware.
 */
const getExercises: RequestHandler<ProgramWorkoutParam> = async (
  req,
  res,
  next,
) => {
  const user_id = req.user_id;
  const { id: program_id, workout_id } = req.params;
  const programId = +program_id;
  const workoutId = +workout_id;

  if (user_id === undefined) {
    return next(new UnauthorizedError("User not found"));
  }

  if (!checkPos(programId) || !checkPos(workoutId)) {
    return next(new BadRequestError("Bad removal request"));
  }

  try {
    const programExists = await programExistsForUser(programId, user_id);
    if (!programExists) {
      return next(new NotFoundError("Program not found"));
    }
    const workoutExists = await workoutExistsForProgram(workoutId, programId);
    if (!workoutExists) {
      return next(new NotFoundError("Workout not found"));
    }
    const exercises = await getWorkoutExercises(workoutId);
    if (exercises.length === 0) {
      return res
        .status(200)
        .json({ message: "No exercises found for this workout" });
    }
    return res
      .status(200)
      .json({ message: "Exercises successfully retrieved", data: exercises });
  } catch (err) {
    return next(err);
  }
};

export {
  makeProgram,
  addWorkout,
  removeWorkout,
  removeProgram,
  getWorkouts,
  getExercises,
  retrievePrograms,
};
