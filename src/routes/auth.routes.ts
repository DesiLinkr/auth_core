import { Router } from "express";
import { validate } from "../middlewares/validate";
import { AuthValidation } from "../validations/auth.validation";
import AuthController from "../controllers/auth.controller";
import ForgotPasswordController from "../controllers/forgotPassword.controller";
import { requestMeta } from "../middlewares/requestMeta";

const authController = new AuthController();
const forgotPasswordController = new ForgotPasswordController();
const AuthRouter = Router();

AuthRouter.post(
  "/register",
  validate(AuthValidation.register),
  authController.register
);

AuthRouter.post(
  "/login",
  requestMeta,
  validate(AuthValidation.login),
  authController.login
);
AuthRouter.post(
  "/verify_reset_token",
  validate(AuthValidation.verifyResetToken),
  forgotPasswordController.verifyResetToken
);

AuthRouter.post(
  "/forgot-password",
  validate(AuthValidation.forgotPassword),
  forgotPasswordController.sendPasswordResetToken
);
AuthRouter.post(
  "/reset-password",
  validate(AuthValidation.resetPassword),
  forgotPasswordController.resetPassword
);

AuthRouter.post(
  "/secure/verify",
  validate(AuthValidation.secureVerifyToken),
  authController.secureVerifyToken
);

AuthRouter.post(
  "/secure/account",
  validate(AuthValidation.secureAccount),
  authController.secureAccount
);
AuthRouter.post(
  "/google",
  requestMeta,
  validate(AuthValidation.google),
  authController.googleSignIn
);
export default AuthRouter;
