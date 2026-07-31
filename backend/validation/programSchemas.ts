import { z } from "zod";

const linkedExerciseSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Exercise name is required"
          : "Exercise name must be a string",
    })
    .trim()
    .min(1, "Exercise name is required")
    .max(50, "Exercise name must not exceed 50 characters"),
  // 0 -> as many as possible
  // positive int -> specific target
  // omitted -> no target
  target_sets: z
    .number("Target sets must be a number")
    .int()
    .nonnegative("Target sets cannot be negative")
    .max(10000)
    .optional(),
  target_reps: z
    .number("Target reps must be a number")
    .int()
    .nonnegative("Target reps cannot be negative")
    .max(10000)
    .optional(),
  target_rest: z
    .number("Target rest must be a number")
    .int()
    .nonnegative("Target rest cannot be negative")
    .default(60),
});

const workoutSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Workout name is required"
          : "Workout name must be a string",
    })
    .trim()
    .min(1, "Workout name is required")
    .max(50, "Workout name must not exceed 50 characters"),
  notes: z.string().trim().max(2000).optional(),
  exercises: z
    .array(linkedExerciseSchema, {
      error: (issue) =>
        issue.input === undefined
          ? "Exercises are required"
          : "Exercises must be an array",
    })
    .min(1, "Workout must contain at least one exercise")
    .max(100),
});

const programSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Program name is required"
          : "Program name must be a string",
    })
    .trim()
    .min(1, "Program name is required")
    .max(50, "Program name must not exceed 50 characters"),
  description: z.string().trim().max(2000).optional(),
  workouts: z
    .array(workoutSchema, {
      error: (issue) =>
        issue.input === undefined
          ? "Workouts must be an array"
          : "Workouts must be an array",
    })
    .max(50, "A program cannot exceed 50 workouts")
    .optional()
    .default([]),
});

type ValidatedLinkedExercise = z.infer<typeof linkedExerciseSchema>;
type ValidatedWorkout = z.infer<typeof workoutSchema>;
type ValidatedProgramBody = z.infer<typeof programSchema>;

export { programSchema, workoutSchema, linkedExerciseSchema };
export type { ValidatedLinkedExercise, ValidatedWorkout, ValidatedProgramBody };
