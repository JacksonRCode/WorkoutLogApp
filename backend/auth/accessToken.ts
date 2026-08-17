import { z } from "zod";
import jwt, { type SignOptions, type VerifyOptions } from "jsonwebtoken";
import { config } from "../config";

const SECRET = config.auth.jwtSecret;

/**
 * Schema for validating tokens.
 */
const AccessTokenClaimsSchema = z.object({
  token_use: z.literal("access"),
  iss: z.literal(config.auth.jwtIssuer),
  aud: z.literal(config.auth.jwtAudience),
  sub: z
    .string()
    .regex(/^[1-9]\d*$/, "sub must be a positive integer")
    .transform(Number)
    .refine(Number.isSafeInteger, "sub must be a safe integer"),
  iat: z.number().int().nonnegative(),
  exp: z.number().int().positive(),
});

/**
 * Creates a token using userId.
 *
 * @returns token.
 * Propagates errors.
 */
const issueAccessToken = (user_id: number): string => {
  if (!Number.isSafeInteger(user_id) || user_id < 1) {
    throw new Error("Invalid user id");
  }

  const userId = String(user_id);

  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: config.auth.jwtExpiresIn,
    issuer: config.auth.jwtIssuer,
    audience: config.auth.jwtAudience,
    subject: userId,
  };

  const payload = { token_use: "access" };

  const token = jwt.sign(payload, SECRET, options);

  return token;
};

/**
 * Verifies token.
 *
 * @returns userId on success.
 * Propagates errors.
 */
const verifyAccessToken = (token: string): number => {
  const options: VerifyOptions = {
    algorithms: ["HS256"],
    issuer: config.auth.jwtIssuer,
    audience: config.auth.jwtAudience,
  };

  const decoded = jwt.verify(token, SECRET, options);

  const validate = AccessTokenClaimsSchema.parse(decoded);
  return validate.sub;
};

export { AccessTokenClaimsSchema, issueAccessToken, verifyAccessToken };
