import { Request, Response } from 'express';
import * as service from '../services/userServices.js';
import * as majorService from '../services/majorServices.js';
import type { RegisterUserDto, LoginUserDto } from '../types/userTypes.js';

const register = async (req: Request, res: Response) => {
    try {
        if (req.method === 'GET') {
            const majors = await majorService.getAllMajors();
            return res.render('user/register', { majors });
        }

        const validationErrors: string[] | undefined = (req as any).validationErrors;
        if (validationErrors && validationErrors.length > 0) {
            const majors = await majorService.getAllMajors();
            return res.status(422).render('user/register', {
                majors,
                error: validationErrors[0],
                formData: req.body,
            });
        }

        const data = req.body as RegisterUserDto;

        if (data.password !== data.confirmPassword) {
            const majors = await majorService.getAllMajors();
            return res.status(400).render('user/register', {
                majors,
                error: 'As senhas não coincidem.',
                formData: req.body,
            });
        }

        await service.registerNewUser(data);

        const majors = await majorService.getAllMajors();
        return res.status(201).render('user/register', {
            majors,
            success: 'Cadastro realizado com sucesso!',
        });
    } catch (error: any) {
        const majors = await majorService.getAllMajors();
        return res.status(500).render('user/register', {
            majors,
            error: error.message ?? 'Erro interno do servidor.',
            formData: req.body,
        });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        if (req.method === 'GET') {
            return res.render('user/login');
        }

        const data = req.body as LoginUserDto;
        const user = await service.authenticateUser(data);

        if (!user) {
            return res.status(401).render('user/login', {
                error: 'Email ou senha incorretos.',
                formData: req.body,
            });
        }

        (req.session as any).userId = user.id;
        (req.session as any).userName = user.fullname;

        return res.redirect('/');
    } catch (error: any) {
        return res.status(500).render('user/login', {
            error: error.message ?? 'Erro interno do servidor.',
            formData: req.body,
        });
    }
};

const logout = (req: Request, res: Response) => {
    req.session.destroy(() => {
        res.redirect('/user/login');
    });
};

export default { register, login, logout };