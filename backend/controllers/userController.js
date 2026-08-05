import { BadRequestError } from "../errors/BadRequestError";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
import { config } from "../config";
import { getLoginInfo, getUserById } from "../db/queries/retrievalQueries";
import { createUser } from "../db/queries/inputQueries";

const SALT_ROUNDS = 10;

const createToken = (id) => {
  return jwt.sign({ user_id: id }, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });
};

/*
 * This function logs a user in and returns all of their info minus their password.
 *
 * Tested: False
 *
 * Accepts: req and res
 *
 * Returns: json user data
 */
const loginUser = async (req, res, next) => {
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

/*
 * This function signs a user up with the f_name, l_name, email, and password.
 *
 * Tested: False
 *
 * Accepts: req and res
 *
 * Returns: user instance
 */
const signupUser = async (req, res, next) => {
  const { f_name, l_name, email, password } = req.body;

  try {
    const hashed_password = await bcrypt.hash(password, SALT_ROUNDS);
    const obj = await createUser(f_name, l_name, email, hashed_password);

    const token = createToken(obj.user_id);

    return res
      .status(201)
      .json({ message: "Successfully created user", token, data: obj });
  } catch (err) {
    if (err.code === "23505") {
      return next(new ConflictError("Email already in use"));
    }
    return next(err);
  }
};

const getMe = async (req, res, next) => {
  const user_id = req.user_id;

  try {
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

module.exports = {
  loginUser,
  signupUser,
  getMe,
};
