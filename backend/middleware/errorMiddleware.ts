import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { ValidationError } from "../errors/ValidationError";

const handleError = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    const response = {
      message: err.message,
      errors: err instanceof ValidationError ? err.errors : undefined,
    };

    return res.status(err.statusCode).json(response);
  }

  return res.status(500).json({
    message: "Internal server error",
  });
};

export { handleError }; // Need to change imports
