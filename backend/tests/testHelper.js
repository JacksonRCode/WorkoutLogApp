const bcrypt = require("bcrypt");
import { pool } from "../db/poolConnection";

const endTesting = async () => {
  await pool.end();
};

const setupTestData = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      TRUNCATE
        users,
        programs,
        workouts,
        program_workouts,
        exercises,
        workout_exercises,
        workout_completed,
        completed_exercises,
        completed_sets,
        user_exercise_stats
      RESTART IDENTITY CASCADE
    `);

    const passwordHash = await bcrypt.hash("password123", 10);

    const userResult = await client.query(
      `
        INSERT INTO users (f_name, l_name, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id
      `,
      ["Test", "User", "test@example.com", passwordHash],
    );

    const userId = userResult.rows[0].user_id;

    const programResult = await client.query(
      `
        INSERT INTO programs (user_id, name, notes)
        VALUES ($1, $2, $3)
        RETURNING program_id
      `,
      [userId, "Test Program", "Test program notes"],
    );

    const programId = programResult.rows[0].program_id;

    const workoutResult = await client.query(
      `
        INSERT INTO workouts (user_id, name, notes)
        VALUES ($1, $2, $3)
        RETURNING workout_id
      `,
      [userId, "Test Workout", "Test workout notes"],
    );

    const workoutId = workoutResult.rows[0].workout_id;

    await client.query(
      `
        INSERT INTO program_workouts (program_id, workout_id)
        VALUES ($1, $2)
      `,
      [programId, workoutId],
    );

    const exerciseResult = await client.query(`
      INSERT INTO exercises (name, muscle_group)
      VALUES
        ('Bench Press', 'Chest'),
        ('Incline Dumbbell Press', 'Chest'),
        ('Chest Fly', 'Chest'),
        ('Squat', 'Legs'),
        ('Leg Press', 'Legs'),
        ('Leg Extension', 'Legs'),
        ('Leg Curl', 'Legs'),
        ('Deadlift', 'Back'),
        ('Pull Up', 'Back'),
        ('Barbell Row', 'Back'),
        ('Overhead Press', 'Shoulders'),
        ('Lateral Raise', 'Shoulders'),
        ('Dumbbell Curl', 'Arms'),
        ('Tricep Pushdown', 'Arms'),
        ('Plank', 'Core')
      RETURNING exercise_id, name
    `);

    const exercises = Object.fromEntries(
      exerciseResult.rows.map((exercise) => [
        exercise.name,
        exercise.exercise_id,
      ]),
    );

    await client.query(
      `
        INSERT INTO workout_exercises
          (
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
        VALUES
          ($1, $2, 1, 3, 10, 225.00, NULL, 90, FALSE, NULL, 'No notes'),
          ($1, $3, 2, 2, NULL, NULL, 60, 30, TRUE, NULL, 'Keep your butt up!')
      `,
      [workoutId, exercises["Bench Press"], exercises.Plank],
    );

    const completedWorkoutResult = await client.query(
      `
        INSERT INTO workout_completed (user_id, workout_id, notes)
        VALUES ($1, $2, $3)
        RETURNING workout_completed_id
      `,
      [userId, workoutId, "Super strong"],
    );

    const completedWorkoutId =
      completedWorkoutResult.rows[0].workout_completed_id;

    const completedExerciseResult = await client.query(
      `
        INSERT INTO completed_exercises
          (
            user_id,
            exercise_id,
            workout_completed_id,
            time_flag,
            notes
          )
        VALUES
          ($1, $2, $4, FALSE, 'Completed!'),
          ($1, $3, $4, TRUE, 'Pain and suffering')
        RETURNING completed_exercise_id, exercise_id
      `,
      [userId, exercises["Bench Press"], exercises.Plank, completedWorkoutId],
    );

    const benchCompletedExercise = completedExerciseResult.rows.find(
      (row) => row.exercise_id === exercises["Bench Press"],
    ).completed_exercise_id;

    const plankCompletedExercise = completedExerciseResult.rows.find(
      (row) => row.exercise_id === exercises.Plank,
    ).completed_exercise_id;

    await client.query(
      `
        INSERT INTO completed_sets
          (
            completed_exercise_id,
            weight,
            reps,
            distance,
            duration,
            rpe,
            set_number
          )
        VALUES
          ($1, 225.5, 10, NULL, NULL, 8.5, 1),
          ($1, 225.5, 9, NULL, NULL, 9, 2),
          ($2, NULL, NULL, NULL, 60, 5, 1),
          ($2, NULL, NULL, NULL, 60, 5.5, 2)
      `,
      [benchCompletedExercise, plankCompletedExercise],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { setupTestData, endTesting };
