const { Router } = require("express");
import { protect } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { signupSchema, loginSchema } from "../validation/userSchemas";
import { loginUser, signupUser, getMe } from "../controllers/userController";

const userRouter = Router();

userRouter.post("/login", validateRequest(loginSchema), loginUser);
userRouter.post("/signup", validateRequest(signupSchema), signupUser);
userRouter.get("/me", protect, getMe);

module.exports = userRouter;
