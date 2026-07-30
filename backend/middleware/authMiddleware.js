const jwt = require("jsonwebtoken");
const config = require("../config");
import { UnauthorizedError } from "../errors/UnauthorizedError";

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, config.auth.jwtSecret);
      req.user_id = decoded.user_id;

      return next();
    } catch (err) {
      return next(new UnauthorizedError("Not authorized, token failed"));
    }
  }

  if (!token) {
    return next(new UnauthorizedError("Not authorized, no token provided"));
  }
};

module.exports = { protect };
