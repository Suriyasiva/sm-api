import Joi from 'joi';

export const createTenantSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  domain: Joi.string().min(3).max(100).required(),
  identifier: Joi.string().min(3).max(50).required(),
  organizationName: Joi.string().min(3).max(100).required(),
});
