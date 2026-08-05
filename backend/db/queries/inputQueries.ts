import { pool } from "../poolConnection";
import type { PoolClient } from "pg";
import type {
  UserRow,
  ProgramRow,
  WorkoutRow,
  ExerciseRow,
  ProgramWorkoutRow,
  WorkoutExerciseRow,
  WorkoutCompletedRow,
  CompletedExerciseRow,
  CompletedSetRow,
} from "../../types/entities";

type CreatedUserRow = Omit<UserRow, "password_hash">;
type CreateCompletedSetInput = Omit<CompletedSetRow, "completed_set_id">;
type CreateCompletedExerciseInput = {
  user_id: number;
  exercise_id: number;
  workout_completed_id: number;
  time_flag?: boolean;
  notes?: string | null;
};
type CreateWorkoutExerciseInput = {
  workout_id: number;
  exercise_id: number;
  order_index: number | null;
  target_sets: number | null;
  target_reps: number | null;
  target_weight: number | null;
  target_duration: number | null;
  rest?: number | null;
  time_flag?: boolean | null;
  distance?: number | null;
  notes?: string | null;
};

/**
 * Creates a new user.
 * @returns Created user object.
 * @throws Propagates database query errors.
 */
const createUser = async (
  first_name: string,
  last_name: string,
  email: string,
  hashed_password: string,
): Promise<CreatedUserRow> => {
  const queryText = `
    INSERT INTO users (f_name, l_name, email, password_hash)
    VALUES
    ($1, $2, $3, $4)
    RETURNING user_id, f_name, l_name, date_joined, email;
  `;

  const values = [first_name, last_name, email, hashed_password];
  const res = await pool.query<CreatedUserRow>(queryText, values);

  return res.rows[0];
};

/**
 * Creates a new program for a user.
 * @returns Created program instance.
 * @throws Propagates database query errors.
 */
const createProgram = async (
  user_id: number,
  program_name: string,
  program_notes: string | null = null,
  client?: PoolClient,
): Promise<ProgramRow> => {
  const queryText = `
    INSERT INTO programs (user_id, name, notes)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [user_id, program_name, program_notes];

  // If there's a separate client
  if (client) {
    const res = await client.query<ProgramRow>(queryText, values);
    return res.rows[0];
  }

  // If using general pool
  const res = await pool.query<ProgramRow>(queryText, values);
  return res.rows[0];
};

/**
 * Creates a new workout.
 * @returns Created workout instance.
 * @throws Propagates database query errors.
 */
const createWorkout = async (
  user_id: number,
  workout_name: string,
  workout_notes: string | null = null,
  client?: PoolClient,
): Promise<WorkoutRow> => {
  const queryText = `
    INSERT INTO workouts (user_id, name, notes)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [user_id, workout_name, workout_notes];

  if (client) {
    const res = await client.query<WorkoutRow>(queryText, values);
    return res.rows[0];
  }

  const res = await pool.query<WorkoutRow>(queryText, values);
  return res.rows[0];
};

/**
 * Links a workout to a specific program in the database.
 * @returns Created relationship instance.
 * @throws Propagates database query errors.
 */
const addProgramWorkout = async (
  program_id: number,
  workout_id: number,
  client?: PoolClient,
): Promise<ProgramWorkoutRow> => {
  const queryText = `
    INSERT INTO program_workouts (program_id, workout_id)
    VALUES ($1, $2)
    RETURNING *;
  `;

  const values = [program_id, workout_id];

  if (client) {
    const res = await client.query<ProgramWorkoutRow>(queryText, values);
    return res.rows[0];
  }
  const res = await pool.query<ProgramWorkoutRow>(queryText, values);
  return res.rows[0];
};

/**
 * Links an exercise to a user's workout.
 * @returns Created workout exercise instance.
 * @throws Propagates database query errors.
 */
const createWorkoutExercises = async (
  {
    exercise_id,
    workout_id,
    order_index,
    target_sets,
    target_reps,
    target_weight,
    target_duration,
    rest = 60,
    time_flag = false,
    distance = 0,
    notes = "",
  }: CreateWorkoutExerciseInput,
  client?: PoolClient,
): Promise<WorkoutExerciseRow> => {
  const queryText = `
    INSERT INTO workout_exercises (
      workout_id, 
      exercise_id, 
      order_index, 
      target_sets, 
      target_reps, 
      target_weight,
      target_duration,
      rest, 
      time_flag, 
      distance, 
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;

  const values = [
    workout_id,
    exercise_id,
    order_index,
    target_sets,
    target_reps,
    target_weight,
    target_duration,
    rest,
    time_flag,
    distance,
    notes,
  ];

  if (client) {
    const res = await client.query<WorkoutExerciseRow>(queryText, values);
    return res.rows[0];
  }
  const res = await pool.query<WorkoutExerciseRow>(queryText, values);
  return res.rows[0];
};

/**
 * Creates an instance of a completed workout.
 * @returns Created completed workout instance.
 * @throws Propagates database query errors.
 */
const createCompletedWorkout = async (
  user_id: number,
  workout_id: number,
  notes: string | null = null,
): Promise<WorkoutCompletedRow> => {
  const queryText = `
  INSERT INTO workout_completed (user_id, workout_id, notes)
  VALUES ($1, $2, $3) 
  RETURNING *; 
  `;

  const values = [user_id, workout_id, notes];

  const res = await pool.query<WorkoutCompletedRow>(queryText, values);
  return res.rows[0];
};
/**
 * Creates a custom exercise.
 *
 * @returns Created exercise instance.
 * @throws Propagates database query errors.
 */
const createUserExercise = async (
  user_id: number,
  exercise_name: string,
  muscle_group: string | null = null,
  notes: string | null = null,
  client?: PoolClient,
): Promise<ExerciseRow> => {
  const sql = `
    INSERT INTO exercises (user_id, name, muscle_group, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [user_id, exercise_name, muscle_group, notes];

  if (client) {
    const res = await client.query<ExerciseRow>(sql, values);
    return res.rows[0];
  }
  const res = await pool.query<ExerciseRow>(sql, values);
  return res.rows[0];
};

/**
 * Creates connection for exercise and completed workout.
 * @returns Completed exercise instance.
 * @throws Propagates database query errors.
 */
const createCompletedExercise = async ({
  user_id,
  exercise_id,
  workout_completed_id,
  time_flag = false,
  notes = "",
}: CreateCompletedExerciseInput): Promise<CompletedExerciseRow> => {
  const queryText = `
    INSERT INTO completed_exercises (user_id, exercise_id, workout_completed_id, time_flag, notes)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [user_id, exercise_id, workout_completed_id, time_flag, notes];

  const res = await pool.query<CompletedExerciseRow>(queryText, values);
  return res.rows[0];
};

/**
 * This function creates a finished set instance.
 * @returns Created set instance.
 * @throws Propagates database query errors.
 */
const createCompletedSet = async ({
  completed_exercise_id,
  weight,
  reps,
  distance,
  duration,
  rpe,
  set_number,
}: CreateCompletedSetInput): Promise<CompletedSetRow> => {
  const queryText = `
    INSERT INTO completed_sets (completed_exercise_id, weight, reps, distance, duration, rpe, set_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    completed_exercise_id,
    weight,
    reps,
    distance,
    duration,
    rpe,
    set_number,
  ];

  const res = await pool.query<CompletedSetRow>(queryText, values);
  return res.rows[0];
};

// NOTE: user_exercise_stats is not accounted for here. I think it should be calculated upon workout completion.
// NOTE: Or maybe calculated upon user input of an exercise?? That paves the way to lot's of mistakes though... hmm

export {
  createUser,
  createProgram,
  createWorkout,
  createUserExercise,
  createWorkoutExercises,
  createCompletedWorkout,
  createCompletedExercise,
  createCompletedSet,
  addProgramWorkout,
};
