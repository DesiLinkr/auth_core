import Joi from "joi";

export class settingsValidation {
  static changePassword = Joi.object({
    newPassword: Joi.string()
      .min(8)
      .required()
      .disallow(Joi.ref("oldPassword")),
    oldPassword: Joi.string().min(8).required(),
  });

  static addEmail = Joi.object({
    email: Joi.string().email().required(),
  });
}
