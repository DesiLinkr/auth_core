import Joi from "joi";

export class AuthValidation {
  static register = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/[A-Z]/)
      .pattern(/[a-z]/)
      .pattern(/[0-9]/)
      .pattern(/[^a-zA-Z0-9]/)
      .required(),
    name: Joi.string().min(5).required(),
  });

  static forgotPassword = Joi.object({
    email: Joi.string().email().required(),
  });

  static login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  static verifyResetToken = Joi.object({
    token: Joi.string().length(64).required(),
  });
  static resetPassword = Joi.object({
    token: Joi.string().length(64).required(),
    password: Joi.string()
      .min(8)
      .pattern(/[A-Z]/)
      .pattern(/[a-z]/)
      .pattern(/[0-9]/)
      .pattern(/[^a-zA-Z0-9]/)
      .required(),
  });

  static secureVerifyToken = Joi.object({
    token: Joi.string().length(64).required(),
  });
  static secureAccount = Joi.object({
    token: Joi.string().length(64).required(),

    newPassword: Joi.string()
      .min(8)
      .pattern(/[A-Z]/)
      .pattern(/[a-z]/)
      .pattern(/[0-9]/)
      .pattern(/[^a-zA-Z0-9]/)
      .required(),

    oldPassword: Joi.string(),
  });
  static google = Joi.object({
    credential: Joi.string().required(),
  });
}
