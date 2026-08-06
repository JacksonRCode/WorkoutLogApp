import type { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { DatabaseError } from "pg";
import type {
  ValidatedLoginBody,
  ValidatedSignupBody,
} from "../validation/userSchemas";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { BadRequestError } from "../errors/BadRequestError";
import { config } from "../config";
import { getLoginInfo, getUserById } from "../db/queries/retrievalQueries";
import { createUser } from "../db/queries/inputQueries";

const SALT_ROUNDS = 10;

const createToken = (id: number): string => {
  const JWT_SECRET: Secret = config.auth.jwtSecret;
  const options: SignOptions = {
    expiresIn: config.auth.jwtExpiresIn,
  };
  return jwt.sign({ user_id: id }, JWT_SECRET, options);
};

/**
 * Logs a user in and returns all of their info minus their password.
 *
 * @returns json user data
 * Passes UnauthorizedError to express middleware for invalid credentials.
 */
const loginUser: RequestHandler<
  Record<string, never>,
  unknown,
  ValidatedLoginBody
> = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await getLoginInfo(email);
    if (!user) {
      return next(new UnauthorizedError("Invalid email or password"));
    }

    const verifyUser = await bcrypt.compare(password, user.password_hash);

    if (verifyUser) {
      const { password_hash, ...user_data } = user;
      const token = createToken(user.user_id);

      return res
        .status(200)
        .json({ message: "Login successful", token, data: user_data });
    }

    return next(new UnauthorizedError("Invalid email or password"));
  } catch (err) {
    return next(err);
  }
};

/**
 * Signs a user up with supplied f_name, l_name, email, and password.
 *
 * @returns created user instance.
 * Passes errors to express middleware for email conflict / db error.
 */
const signupUser: RequestHandler<
  Record<string, never>,
  unknown,
  ValidatedSignupBody
> = async (req, res, next) => {
  const { f_name, l_name, email, password } = req.body;

  try {
    const hashed_password = await bcrypt.hash(password, SALT_ROUNDS);
    const createdUser = await createUser(
      f_name,
      l_name,
      email,
      hashed_password,
    );

    const token = createToken(createdUser.user_id);

    return res
      .status(201)
      .json({ message: "Successfully created user", token, data: createdUser });
  } catch (err: unknown) {
    if (err instanceof DatabaseError && err.code === "23505")
      return next(new ConflictError("Email already in use"));
    return next(err);
  }
};

/**
 * Retrieves a user's id, first name, last name, and email.
 *
 * @returns user data.
 * Passes NotFoundError to express middleware.
 */
const getMe: RequestHandler = async (req, res, next) => {
  const user_id = req.user_id;

  try {
    if (user_id === undefined) {
      return next(new BadRequestError("User id not valid"));
    }
    const user = await getUserById(user_id);

    if (!user) {
      return next(new NotFoundError("User not found"));
    }
    const { password_hash, ...user_data } = user;

    return res.status(200).json({ message: "User found", data: user_data });
  } catch (err) {
    return next(err);
  }
};

export { loginUser, signupUser, getMe };
