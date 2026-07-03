import { Request, Response } from 'express';
import { getTopRanking } from '../services/rankingServices.js';

const rankingController = {
    async index(req: Request, res: Response) {
        try {
            const ranking = await getTopRanking();
            res.render('ranking', { ranking });
        } catch (error: any) {
            res.status(500).render('ranking', {
                ranking: [],
                error: 'Erro ao carregar o ranking.',
            });
        }
    }
};

export default rankingController;