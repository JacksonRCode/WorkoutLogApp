// 401 - Invalid email or password --> unauthorized
import { AppError } from "./AppError";

class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized resource") {
    super(message, 401);
  }
}

export { UnauthorizedError };
