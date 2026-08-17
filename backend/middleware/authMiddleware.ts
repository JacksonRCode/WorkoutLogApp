import type { RequestHandler } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { verifyAccessToken } from "../auth/accessToken";
import { UnauthorizedError } from "../errors/UnauthorizedError";

function extractToken(authHeader: string): string | null {
  const rex = /^Bearer\s+(?<token>[A-Za-z0-9\-._~+/]+=*)$/i;
  const match = authHeader.match(rex);

  return match?.groups?.token ?? null;
}

const protect: RequestHandler = (req, _res, next) => {
  if (req.headers.authorization === undefined) {
    return next(new UnauthorizedError("Access token required"));
  }
  const token = extractToken(req.headers.authorization);

  if (token) {
    try {
      const userId = verifyAccessToken(token);

      req.user_id = userId;

      return next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return next(new UnauthorizedError("Access token expired"));
      }
      return next(new UnauthorizedError("Invalid access token"));
    }
  }

  return next(new UnauthorizedError("Invalid access token"));
};

export { protect };
