import { type RequestHandler } from "express";
import jwt from "jsonwebtoken";
const config = require("../config");
import { UnauthorizedError } from "../errors/UnauthorizedError";

const protect: RequestHandler = (req, _res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, config.auth.jwtSecret);

      // Make sure decoded isn't a string and includes numeric user_id
      if (
        typeof decoded !== "string" &&
        "user_id" in decoded &&
        typeof decoded.user_id === "number"
      ) {
        req.user_id = decoded.user_id;
        return next();
      }

      return next(new UnauthorizedError("Not authorized, token failed"));
    } catch (err) {
      return next(new UnauthorizedError("Not authorized, token failed"));
    }
  }

  if (!token) {
    return next(new UnauthorizedError("Not authorized, no token provided"));
  }
};

export { protect };
