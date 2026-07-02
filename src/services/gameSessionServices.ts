import prisma from '../prisma/prisma-client.js';

export const saveGameSession = async (userId: string, score: number) => {
    return prisma.gameSession.create({
        data: { userId, score },
    });
};