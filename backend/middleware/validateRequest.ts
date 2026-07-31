import { z } from "zod";
import { type RequestHandler } from "express";
import { ValidationError } from "../errors/ValidationError";

function validateRequest<Type extends z.Schema>(schema: Type): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new ValidationError(errors));
    }

    req.body = result.data;
    return next();
  };
}

export { validateRequest };
