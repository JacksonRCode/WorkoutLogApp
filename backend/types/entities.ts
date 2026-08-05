interface UserRow {
  user_id: number;
  f_name: string;
  l_name: string;
  email: string;
  password_hash: string;
  date_joined: Date | null;
}
interface ProgramRow {
  program_id: number;
  user_id: number;
  name: string;
  date_created: Date | null;
  notes: string | null;
}
interface WorkoutRow {
  workout_id: number;
  user_id: number;
  name: string;
  notes: string | null;
}
interface ExerciseRow {
  exercise_id: number;
  user_id: number | null;
  name: string;
  muscle_group: string | null;
  notes: string | null;
}
interface ProgramWorkoutRow {
  program_id: number;
  workout_id: number;
}
interface WorkoutExerciseRow {
  workout_id: number;
  exercise_id: number;
  order_index: number | null;
  target_sets: number | null;
  target_reps: number | null;
  target_weight: number | null;
  target_duration: number | null;
  rest: number | null;
  time_flag: boolean | null;
  distance: number | null;
  notes: string | null;
}
interface WorkoutCompletedRow {
  workout_completed_id: number;
  user_id: number;
  workout_id: number | null;
  start_time: Date | null;
  end_time: Date | null;
  notes: string | null;
}
interface CompletedExerciseRow {
  completed_exercise_id: number;
  user_id: number;
  exercise_id: number;
  workout_completed_id: number;
  time_flag: boolean | null;
  notes: string | null;
}
interface CompletedSetRow {
  completed_set_id: number;
  completed_exercise_id: number;
  weight: number | null;
  reps: number | null;
  distance: number | null;
  duration: number | null;
  rpe: number | null;
  set_number: number;
}
export type {
  UserRow,
  ProgramRow,
  WorkoutRow,
  ExerciseRow,
  ProgramWorkoutRow,
  WorkoutExerciseRow,
  WorkoutCompletedRow,
  CompletedExerciseRow,
  CompletedSetRow,
};
