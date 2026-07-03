import { Request, Response, NextFunction } from 'express';

const locals = (req: Request, res: Response, next: NextFunction) => {
    res.locals.userName = (req.session as any).userName ?? null;
    res.locals.isLoggedIn = !!(req.session as any).userId;
    next();
};

export default locals;