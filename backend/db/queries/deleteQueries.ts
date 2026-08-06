import { pool } from "../poolConnection";

/**
 * Removes link between a workout and a program.
 *
 * Does not delete the workout.
 *
 * @returns true if relationship is deleted, and false on failure.
 * @throws Propagates database query errors.
 */
const removeProgramWorkout = async (
  program_id: number,
  workout_id: number,
): Promise<boolean> => {
  const queryText = `
    DELETE FROM program_workouts 
    WHERE program_id = $1 AND workout_id = $2;
  `;

  const res = await pool.query(queryText, [program_id, workout_id]);
  return (res.rowCount ?? 0) > 0;
};

/**
 * Deletes a user's program.
 *
 * @returns true if program is deleted, and false if not found.
 * @throws Propagates database query errors.
 */
const deleteProgram = async (
  user_id: number,
  program_id: number,
): Promise<boolean> => {
  const sql = `
    DELETE FROM programs
    WHERE user_id = $1 AND program_id = $2;
  `;

  const res = await pool.query(sql, [user_id, program_id]);
  return (res.rowCount ?? 0) > 0;
};

export { removeProgramWorkout, deleteProgram };
