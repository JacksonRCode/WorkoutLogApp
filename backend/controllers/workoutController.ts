import type { PoolClient } from "pg";
import type {
  ValidatedWorkout,
  ValidatedLinkedExercise,
} from "../validation/programSchemas";
import type { ExerciseRow, WorkoutRow } from "../types/entities";
import {
  createWorkout,
  createUserExercise,
  createWorkoutExercises,
} from "../db/queries/inputQueries";

import { getExerciseByName } from "../db/queries/retrievalQueries";

/**
 * Creates a custom user exercise if the user enters an exercise
 * name that isn't in the database.
 *
 * IMPORTANT: GET RID OF THIS EVENTUALLY AND USE PREDETERMINED EXERCISES
 *
 * @returns Created exercise instance.
 * Propagates errors.
 */
const createExercise = async (
  user_id: number,
  exercise_name: string,
  client?: PoolClient,
): Promise<ExerciseRow> => {
  const exercise = await createUserExercise(
    user_id,
    exercise_name,
    null,
    null,
    client,
  );
  return exercise;
};

/**
 * Creates a workout entity that exercises can be added to.
 * This gets connected to the program.
 *
 * @returns Created workout entity.
 * Propagates errors.
 */
const createWorkoutShell = async (
  user_id: number,
  workout_name: string,
  workout_notes?: string,
  client?: PoolClient,
): Promise<WorkoutRow> => {
  const shell = await createWorkout(
    user_id,
    workout_name,
    workout_notes,
    client,
  );
  return shell;
};

/**
 * Links exercises to a workout.
 *
 * @returns nothing
 * Propagates errors.
 */
const linkWorkoutExercises = async (
  user_id: number,
  w_id: number,
  exercises: ValidatedLinkedExercise[],
  client?: PoolClient,
): Promise<void> => {
  for (let i = 0; i < exercises.length; i++) {
    const { name, target_sets, target_reps, target_rest } = exercises[i];

    let exercise = await getExerciseByName(name, client);

    if (!exercise) {
      exercise = await createExercise(user_id, name, client);
    }

    // Create link between exercise and workout
    await createWorkoutExercises(
      {
        exercise_id: exercise.exercise_id,
        workout_id: w_id,
        order_index: i + 1,
        target_sets,
        target_reps,
        target_weight: 0,
        target_duration: 0,
        rest: target_rest,
        time_flag: false,
        distance: 0,
        notes: "None",
      },
      client,
    );
  }
};

/**
 * Orchestrates workout creation
 *
 * @returns workout ids so that they can be attached to a program.
 * Propagates errors.
 */
const compileWorkout = async (
  user_id: number,
  workouts: ValidatedWorkout[],
  client?: PoolClient,
): Promise<number[]> => {
  const workout_ids: number[] = [];

  for (const w of workouts) {
    const w_shell = await createWorkoutShell(user_id, w.name, w.notes, client);
    workout_ids.push(w_shell.workout_id);

    await linkWorkoutExercises(
      user_id,
      w_shell.workout_id,
      w.exercises,
      client,
    );
  }

  return workout_ids;
};

export { compileWorkout };
