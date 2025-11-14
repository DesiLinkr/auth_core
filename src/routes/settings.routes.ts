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

settingsRouter.post(
  "/add-email",
  validate(settingsValidation.email),
  verifyAccessToken,
  settingsController.addNewEmail
);
settingsRouter.post(
  "/remove-email",
  validate(settingsValidation.email),
  verifyAccessToken,
  settingsController.removeEmail
);

settingsRouter.post(
  "/remove-email",
  validate(settingsValidation.email),
  verifyAccessToken,
  settingsController.removeEmail
);

settingsRouter.post(
  "/change-primary-email",
  validate(settingsValidation.email),
  verifyAccessToken,
  settingsController.changePrimaryEmail
);
export default settingsRouter;
