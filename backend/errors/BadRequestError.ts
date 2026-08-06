// 400 - Request is malformed or missing required input
import { AppError } from "./AppError";

class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400);
  }
}

export { BadRequestError };
