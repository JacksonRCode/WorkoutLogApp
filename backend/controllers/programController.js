//controllers/programController.js
const pool = require("../db/poolConnection.js");
import { BadRequestError } from "../errors/BadRequestError";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";

const {
  createProgram,
  addProgramWorkout,
} = require("../db/queries/inputQueries.js");
const {
  getPrograms,
  getProgramWorkouts,
  getWorkoutExercises,
  workoutExistsForProgram,
  programExistsForUser,
} = require("../db/queries/retrievalQueries.js");
const {
  deleteProgram,
  removeProgramWorkout,
} = require("../db/queries/deleteQueries.js");
const compileWorkout = require("../controllers/workoutController.js");

const retrievePrograms = async (req, res, next) => {
  const user_id = req.user_id;

  try {
    const programs = await getPrograms(user_id);
    return res.status(200).json({ data: programs });
  } catch (err) {
    return next(err);
  }
};

const addWorkout = async (program_id, workout_id, client) => {
  try {
    await addProgramWorkout(program_id, workout_id, client);
  } catch (err) {
    throw err;
  }
};

const makeProgram = async (req, res, next) => {
  const user_id = req.user_id;
  const { name: programName, description: programDesc, workouts } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const inst = await createProgram(user_id, programName, programDesc, client);
    const workout_ids = await compileWorkout(user_id, workouts, client);
    for (const id of workout_ids) {
      await addWorkout(inst.program_id, id, client);
    }

    await client.query("COMMIT");

    return res
      .status(201)
      .json({ message: "Program creation successful", data: inst });
  } catch (err) {
    await client.query("ROLLBACK");

    if (err.code === "23505") {
      return next(new ConflictError("Program name already in use"));
    }
    return next(err);
  } finally {
    client.release();
  }
};

const removeProgram = async (req, res, next) => {
  const { id: program_id } = req.params;
  const user_id = req.user_id;

  try {
    const response = await deleteProgram(user_id, program_id);
    if (!response) {
      return next(new NotFoundError("Program not found"));
    }
    return res.status(200).json({ message: "Program deleted" });
  } catch (err) {
    return next(err);
  }
};

const removeWorkout = async (req, res, next) => {
  /*
   * This function removes a workout from a program
   *
   * Tested: false
   *
   * Returns: boolean
   */
  const { id: program_id, workout_id } = req.params;

  try {
    const response = await removeProgramWorkout(program_id, workout_id);
    if (!response) {
      return next(new NotFoundError("Workout not found in program"));
    }
    return res.status(200).json({ message: "Workout deleted from program" });
  } catch (err) {
    return next(err);
  }
};

/**
 * @async
 * This function retrieves workouts relating to a certain program.
 */
const getWorkouts = async (req, res, next) => {
  const { id: program_id } = req.params;
  const user_id = req.user_id;

  try {
    const programExists = await programExistsForUser(program_id, user_id);
    if (!programExists) {
      return next(new NotFoundError("Program not found"));
    }

    const workouts = await getProgramWorkouts(program_id);
    if (workouts.length == 0) {
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
 * @async
 * This function retrieves exercises relating to a given workout id.
 */
const getExercises = async (req, res, next) => {
  const { id: program_id, workout_id } = req.params;
  const user_id = req.user_id;

  try {
    const programExists = await programExistsForUser(program_id, user_id);
    if (!programExists) {
      return next(new NotFoundError("Program not found"));
    }
    const workoutExists = await workoutExistsForProgram(workout_id, program_id);
    if (!workoutExists) {
      return next(new NotFoundError("Workout not found"));
    }
    const exercises = await getWorkoutExercises(workout_id);
    if (!exercises || exercises.length == 0) {
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

module.exports = {
  makeProgram,
  addWorkout,
  removeWorkout,
  removeProgram,
  getWorkouts,
  getExercises,
  retrievePrograms,
};
