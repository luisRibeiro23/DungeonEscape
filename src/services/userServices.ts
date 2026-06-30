import { compare, genSalt, hash } from 'bcryptjs';
import prisma from '../prisma/prisma-client.js';
import type { User } from '../generated/prisma/client.js';
import type { RegisterUserDto, LoginUserDto } from '../types/userTypes.js';

const ROUNDS = parseInt(process.env.ROUNDS_BCRYPT ?? '10');

export const getUserByEmail = async (email: string): Promise<User | null> => {
    return prisma.user.findFirst({ where: { email } });
};

export const registerNewUser = async (data: RegisterUserDto): Promise<User> => {
    const existing = await getUserByEmail(data.email);
    if (existing) {
        throw new Error('Email já está em uso.');
    }

    const salt = await genSalt(ROUNDS);
    const hashedPassword = await hash(data.password, salt);

    return prisma.user.create({
        data: {
            fullname: data.fullname,
            email: data.email,
            password: hashedPassword,
            majorId: data.majorId,
        },
    });
};

export const authenticateUser = async (data: LoginUserDto): Promise<User | null> => {
    const user = await getUserByEmail(data.email);
    if (!user) return null;

    const valid = await compare(data.password, user.password);
    return valid ? user : null;
};