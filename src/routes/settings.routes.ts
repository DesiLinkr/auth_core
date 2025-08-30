import { Router } from "express";
import { SettingsController } from "../controllers/settings.controller";
import { verifyAccessToken } from "../middlewares/auth.middleware";
import { settingsValidation } from "../validations/settings.validation";
import { validate } from "../middlewares/validate";

const settingsRouter = Router();
const settingsController = new SettingsController();
settingsRouter.post(
  "/change-password",
  validate(settingsValidation.changePassword),
  verifyAccessToken,
  settingsController.changepassword
);
export default settingsRouter;
