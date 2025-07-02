import { Router } from "express";
import { validate } from "../Middlewares/validate";
import { AuthValidation } from "../validations/auth.validation";
import AuthController from "../controllers/auth.controller";

const authController = new AuthController();
const AuthRouter = Router();

AuthRouter.post(
  "/register",
  validate(AuthValidation.register),
  authController.register
);

AuthRouter.post(
  "/forgot-password",
  validate(AuthValidation.forgotPassword),
  authController.forgotPassword)

export default AuthRouter;
