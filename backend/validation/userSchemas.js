const { z } = require("zod");

const signupSchema = z.object({
  f_name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "First name is required"
          : "First name must be a string",
    })
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters"),
  l_name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Last name is required"
          : "Last name must be a string",
    })
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters"),
  email: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Email is required"
          : "Email must be a string",
    })
    .trim()
    .toLowerCase()
    .pipe(z.email("Email must be valid")),
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Password is required"
          : "Password must be a string",
    })
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must not exceed 64 characters")
    .regex(
      /^[\x21-\x7E]+$/,
      "Password may only contain letters, numbers, and standard symbols",
    ),
});

const loginSchema = z.object({
  email: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Email is required"
          : "Email must be a string",
    })
    .trim()
    .toLowerCase()
    .pipe(z.email("Email must be valid")),
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Password is required"
          : "Password must be a string",
    })
    .min(1, "Password is required"),
});

module.exports = { signupSchema, loginSchema };
