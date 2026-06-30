import { Request, Response } from 'express';
import * as service from '../services/majorServices.js';

const index = async (req: Request, res: Response) => {
    try {
        const majors = await service.getAllMajors();
        res.status(200).render('major/index', { majors });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao buscar cursos.' });
    }
};

const create = async (req: Request, res: Response) => {
    try {
        if (req.method === 'GET') {
            res.render('major/form');
        } else {
            await service.createMajor(req.body);
            res.status(201).redirect('/major');
        }
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'Já existe um curso com essa sigla. Use uma sigla diferente.' });
        } else {
            res.status(500).json({ message: 'Erro ao criar curso.' });
        }
    }
};

const read = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const major = await service.getMajor(id);

        if (!major) {
            res.status(404).json({ message: 'Curso não encontrado.' });
            return;
        }

        res.status(200).render('major/info', { major });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao buscar curso.' });
    }
};

const update = async (req: Request<{ id: string }>, res: Response) => {
    try {
        if (req.method === 'GET') {
            res.render('major/form', {
                data: await service.getMajor(req.params.id),
            });
        } else {
            await service.updateMajor(req.params.id, req.body);
            res.status(200).redirect('/major');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao atualizar curso.' });
    }
};

const remove = async (req: Request, res: Response) => {
    try {
        await service.removeMajor(req.params.id as string);
        res.status(200).json({ success: true, message: 'Major removido com sucesso' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Erro ao remover major' });
    }
};

export default { index, read, create, update, remove };