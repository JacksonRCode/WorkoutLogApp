// 409 - Request conflicts with existing state
import { AppError } from "./AppError";

class ConflictError extends AppError {
  constructor(message: string = "Conflict with existing state") {
    super(message, 409);
  }
}

export { ConflictError };
