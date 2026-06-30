import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

const validate = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
            return next();
        }
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            // Retorna os detalhes de erro para que o controller possa usá-los
            (req as any).validationErrors = error.details.map((d: any) => d.message);
            return next();
        }
        next();
    };
};

export default validate;