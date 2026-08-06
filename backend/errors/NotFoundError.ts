// 404 - Requested resource does not exist / was not found
import { AppError } from "./AppError";

class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export { NotFoundError };
