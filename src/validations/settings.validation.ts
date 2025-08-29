import Joi from "joi";

export class settingsValidation {
  static changePassword = Joi.object({
    newPassword: Joi.string().min(8).required(),
    oldPassword: Joi.string().min(8).required(),
  });
}
