import { AppError } from "./AppError";

class ValidationError extends AppError {
  errors: { field: string; message: string }[];
  constructor(errors: { field: string; message: string }[]) {
    super("Validation failed", 400);
    this.errors = errors;
  }
}

export { ValidationError };
