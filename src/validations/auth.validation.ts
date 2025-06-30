import Joi from "joi";

export class AuthValidation {
  static register = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(5).required(),
  });
}
