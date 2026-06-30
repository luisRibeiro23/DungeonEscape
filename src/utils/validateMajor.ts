import Joi from 'joi';

export const majorSchema = Joi.object({
    name: Joi.string().max(100).optional().allow(''),
    code: Joi.string().max(4).optional().allow(''),
    description: Joi.string().optional().allow('').default(null),
});