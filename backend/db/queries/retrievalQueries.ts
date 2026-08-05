import { pool } from "../poolConnection";
import type { PoolClient } from "pg";
import type {
  UserRow,
  ProgramRow,
  WorkoutRow,
  WorkoutExerciseRow,
  ExerciseRow,
  WorkoutCompletedRow,
  CompletedExerciseRow,
  CompletedSetRow,
} from "../../types/entities";

type UserDataRow = Pick<
  UserRow,
  "user_id" | "f_name" | "l_name" | "date_joined"
>;
type UserByIdRow = Pick<
  UserRow,
  "user_id" | "f_name" | "l_name" | "email" | "password_hash"
>;
type WorkoutExerciseInfo = WorkoutExerciseRow & { name: string | null };
type CompletedWorkoutId = Pick<WorkoutCompletedRow, "workout_completed_id">;
type PreviousWorkoutInfoRow = Pick<
  CompletedExerciseRow,
  "completed_exercise_id" | "exercise_id" | "workout_completed_id" | "notes"
> &
  Omit<
    CompletedSetRow,
    "completed_exercise_id" | "completed_set_id" | "set_number"
  > & {
    completed_set_id: number | null;
    set_number: number | null;
  };

/**
 * Retrieves user data using their email.
 *
 * @returns Promise with user information, besides their email and password.
 * @throws Propagates database query errors.
 */
const getUserData = async (email: string): Promise<UserDataRow | undefined> => {
  const queryText = `SELECT user_id, f_name, l_name, date_joined FROM users WHERE email = $1;`;

  const res = await pool.query<UserDataRow>(queryText, [email]);
  return res.rows[0];
};

/**
 * Retrieves user data and hashed password via user_id
 *
 * @returns Promise with user information, including their password
 * @throws Propagates database query errors.
 */
const getUserById = async (
  user_id: number,
): Promise<UserByIdRow | undefined> => {
  const sql = `
    SELECT user_id, f_name, l_name, email, password_hash
    FROM users
    WHERE user_id = $1;
  `;

  const result = await pool.query<UserByIdRow>(sql, [user_id]);
  return result.rows[0];
};

/**
 * Checks to see if an email is being used in the database.
 *
 * @returns boolean.
 * @throws Propagates database query errors.
 */
const checkEmail = async (email: string): Promise<boolean> => {
  const queryText = `SELECT 1 FROM users WHERE email = $1;`;

  const res = await pool.query(queryText, [email]);
  return (res.rowCount ?? 0) > 0;
};

/**
 * Checks to see if a program exists for a user.
 *
 * @returns boolean.
 * @throws Propagates database query errors.
 */
const programExistsForUser = async (
  program_id: number,
  user_id: number,
): Promise<boolean> => {
  const sql = `
    SELECT 1 FROM programs
    WHERE program_id = $1 
      AND user_id = $2;
  `;

  const res = await pool.query(sql, [program_id, user_id]);
  return res.rows.length === 1;
};

/**
 * Checks if a workout exists in a program.
 *
 * @returns boolean.
 * @throws Propagates database query errors.
 */
const workoutExistsForProgram = async (
  workout_id: number,
  program_id: number,
): Promise<boolean> => {
  const sql = `
    SELECT 1 FROM program_workouts
    WHERE workout_id = $1
      AND program_id = $2;
  `;

  const res = await pool.query(sql, [workout_id, program_id]);
  return (res.rowCount ?? 0) > 0;
};

/**
 * Retrieves a users programs via user_id.
 *
 * @returns List of program objects.
 * @throws Propagates database query errors.
 */
const getPrograms = async (user_id: number): Promise<ProgramRow[]> => {
  const queryText = `SELECT * FROM programs WHERE user_id = $1;`;

  const res = await pool.query<ProgramRow>(queryText, [user_id]);
  return res.rows;
};

/**
 * Retrieves a user's workouts via user_id.
 *
 * @returns List of workout objects.
 * @throws Propagates database query errors.
 */
const getUserWorkouts = async (user_id: number): Promise<WorkoutRow[]> => {
  const queryText = `SELECT * FROM workouts WHERE user_id = $1;`;

  const res = await pool.query<WorkoutRow>(queryText, [user_id]);
  return res.rows;
};

/**
 * Returns workouts associated with a program.
 *
 * @returns List of workouts.
 * @throws Propagates database query errors.
 */
const getProgramWorkouts = async (
  program_id: number,
): Promise<WorkoutRow[]> => {
  const queryText = `
    SELECT w.* FROM workouts w
    JOIN program_workouts pw ON w.workout_id = pw.workout_id
    WHERE pw.program_id = $1;
  `;

  const res = await pool.query<WorkoutRow>(queryText, [program_id]);
  return res.rows;
};

/**
 * Retrieves exercise info for a workout.
 *
 * @returns exercise names and specifications for a workout.
 * @throws Propagates database query errors.
 */
const getWorkoutExercises = async (
  workout_id: number,
): Promise<WorkoutExerciseInfo[]> => {
  const sql = `
    SELECT we.*, e.name 
    FROM workout_exercises we
    LEFT JOIN exercises e ON we.exercise_id = e.exercise_id
    WHERE we.workout_id = $1
    ORDER BY we.order_index ASC;
  `;

  const response = await pool.query<WorkoutExerciseInfo>(sql, [workout_id]);
  return response.rows;
};

/**
 * Finds previous workout completion for a given workout.
 *
 * @returns List
 * @throws Propagates db query errors
 */
const getPreviousWorkout = async (
  workout_id: number,
): Promise<PreviousWorkoutInfoRow[]> => {
  const sql = `
    SELECT workout_completed_id FROM workout_completed 
    WHERE workout_id = $1
    ORDER BY start_time DESC NULLS LAST
    LIMIT 1;
  `;
  const sqlRes = await pool.query<CompletedWorkoutId>(sql, [workout_id]);
  const prevWorkout = sqlRes.rows[0];

  if (!prevWorkout) {
    return [];
  }

  // join on completed sets to get the stat history of each completed exercise.
  const joinQuery = `SELECT 
    ce.completed_exercise_id, ce.exercise_id, ce.workout_completed_id, ce.notes,
    cs.completed_set_id, cs.weight, cs.reps, cs.distance, cs.duration, cs.rpe, cs.set_number 
    FROM completed_exercises ce
    LEFT JOIN completed_sets cs 
    ON ce.completed_exercise_id = cs.completed_exercise_id
    WHERE ce.workout_completed_id = $1
    ORDER BY 
      ce.completed_exercise_id ASC,
      cs.set_number;`;
  const res = await pool.query<PreviousWorkoutInfoRow>(joinQuery, [
    prevWorkout.workout_completed_id,
  ]);
  return res.rows;
};

/**
 * Retrieves list of all exercises.
 *
 * @returns rows of exercises.
 * @throws Propagates database query errors.
 */
const getExercises = async (): Promise<ExerciseRow[]> => {
  const queryText = `
    SELECT * FROM exercises;
  `;

  const res = await pool.query<ExerciseRow>(queryText);
  return res.rows;
};

/**
 * Retrieves an exercise by its id
 *
 * @returns exercise instance
 */
const getExerciseById = async (
  id: number,
): Promise<ExerciseRow | undefined> => {
  const sql = `
    SELECT * FROM exercises 
    WHERE exercise_id = $1
  `;

  const res = await pool.query<ExerciseRow>(sql, [id]);
  return res.rows[0];
};

/** Returns exercise information using exercise name.
 *
 * @returns exercise info or undefined.
 * @throws Propagates database query errors.
 */
const getExerciseByName = async (
  name: string,
  client: PoolClient | undefined,
): Promise<ExerciseRow | undefined> => {
  const sql = `
    SELECT * FROM exercises 
    WHERE name = $1
  `;

  if (client) {
    const res = await client.query<ExerciseRow>(sql, [name]);
    return res.rows[0];
  }
  const res = await pool.query<ExerciseRow>(sql, [name]);
  return res.rows[0];
};

/**
 * Returns the user's email and password for authentication purposes.
 *
 * @returns user info
 * @throws Propagates database query errors.
 */
const getLoginInfo = async (email: string): Promise<UserRow | undefined> => {
  const queryText = `
    SELECT * FROM users
    WHERE email = $1;
  `;

  const res = await pool.query<UserRow>(queryText, [email]);
  return res.rows[0];
};

export {
  getUserData,
  getUserById,
  programExistsForUser,
  workoutExistsForProgram,
  checkEmail,
  getPrograms,
  getUserWorkouts,
  getProgramWorkouts,
  getWorkoutExercises,
  getPreviousWorkout,
  getExercises,
  getExerciseById,
  getExerciseByName,
  getLoginInfo,
};
