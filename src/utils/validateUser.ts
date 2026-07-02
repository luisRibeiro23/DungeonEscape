import Joi from 'joi';

export const registerSchema = Joi.object({
    fullname: Joi.string().max(100).required().messages({
        'string.empty': 'O nome completo é obrigatório.',
        'any.required': 'O nome completo é obrigatório.',
        'string.max': 'O nome deve ter no máximo 100 caracteres.',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'O e-mail é obrigatório.',
        'string.email': 'Informe um e-mail válido.',
        'any.required': 'O e-mail é obrigatório.',
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'A senha é obrigatória.',
        'string.min': 'A senha deve ter no mínimo 6 caracteres.',
        'any.required': 'A senha é obrigatória.',
    }),
    confirmPassword: Joi.string().required().messages({
        'string.empty': 'A confirmação de senha é obrigatória.',
        'any.required': 'A confirmação de senha é obrigatória.',
    }),
    majorId: Joi.string().required().messages({
        'string.empty': 'Selecione um curso.',
        'any.required': 'Selecione um curso.',
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.empty': 'O e-mail é obrigatório.',
        'string.email': 'Informe um e-mail válido.',
        'any.required': 'O e-mail é obrigatório.',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'A senha é obrigatória.',
        'any.required': 'A senha é obrigatória.',
    }),
});