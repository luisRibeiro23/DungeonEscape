import { Request, Response } from 'express';
import * as service from '../services/gameSessionServices.js';

const save = async (req: Request, res: Response) => {
    try {
        const userId = (req.session as any).userId;
        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado.' });
        }

        const score = parseInt(req.body.score);
        if (isNaN(score) || score < 0) {
            return res.status(400).json({ error: 'Score inválido.' });
        }

        const session = await service.saveGameSession(userId, score);
        return res.status(201).json({ success: true, session });
    } catch (error: any) {
        return res.status(500).json({ error: error.message ?? 'Erro interno.' });
    }
};

export default { save };