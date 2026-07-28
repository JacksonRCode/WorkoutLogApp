// controllers/workoutController.js
const {
  createWorkout,
  createUserExercise,
  createWorkoutExercises,
} = require("../db/queries/inputQueries.js");

const {
  getExerciseById,
  getExerciseByName,
} = require("../db/queries/retrievalQueries.js");

/**
 * This function creates a custom user exercise if the user enters an exercise
 * name that isn't in the database.
 *
 * Returns the exercise instance.
 */
const createExercise = async (user_id, exercise_name, client) => {
  try {
    const exercise = await createUserExercise(
      user_id,
      exercise_name,
      null,
      null,
      client,
    );
    return exercise;
  } catch (err) {
    return next(err);
  }
};

/**
 * This function creates a workout entity that exercises can be added to, and that can
 * be linked to a program entity.
 *
 * Returns the workout entity.
 */
const createWorkoutShell = async (
  user_id,
  workout_name,
  workout_notes,
  client,
) => {
  try {
    const shell = await createWorkout(
      user_id,
      workout_name,
      workout_notes,
      client,
    );
    return shell;
  } catch (err) {
    console.error("Error creating workout shell: ", err.message);
    throw err;
  }
};

/**
 * This function links exercises to a workout shell.
 *
 * Returns nothing.
 */
const linkWorkoutExercises = async (user_id, w_id, exercises, client) => {
  for (let i = 0; i < exercises.length; i++) {
    const { name, target_sets, target_reps, target_rest } = exercises[i];

    try {
      let exercise = await getExerciseByName(name, client);

      if (!exercise) {
        // Create exercise in database
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
          target_rest,
          time_f: false,
          distance: 0,
          notes: "None",
        },
        client,
      );
    } catch (err) {
      console.error("Error linking exercise to workout: ", err.message);
      throw err;
    }
  }
};

const compileWorkout = async (user_id, workouts, client) => {
  const workout_ids = [];
  try {
    for (const w of workouts) {
      const w_shell = await createWorkoutShell(
        user_id,
        w.name,
        w.notes,
        client,
      );
      workout_ids.push(w_shell.workout_id);

      await linkWorkoutExercises(
        user_id,
        w_shell.workout_id,
        w.exercises,
        client,
      );
    }

    return workout_ids;
  } catch (err) {
    console.error("Error compiling workout: ", err.message);
    throw err;
  }
};

module.exports = compileWorkout;
