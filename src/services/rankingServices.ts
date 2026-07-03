import prisma from '../prisma/prisma-client.js';

export const getTopRanking = async () => {
    // Busca o maior score de cada usuário, ordena decrescente, limita a 10
    const sessions = await prisma.gameSession.findMany({
        select: {
            score: true,
            user: {
                select: {
                    fullname: true,
                    major: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { score: 'desc' },
    });

    // Filtra para manter apenas o maior score por usuário (distinto)
    const seen = new Set<string>();
    const ranking = [];

    for (const session of sessions) {
        const name = session.user.fullname;
        if (!seen.has(name)) {
            seen.add(name);
            ranking.push({
                fullname: name,
                major: session.user.major.name,
                score: session.score,
            });
        }
        if (ranking.length === 10) break;
    }

    return ranking;
};

export const getUserHighScore = async (userId: string): Promise<number> => {
    const best = await prisma.gameSession.findFirst({
        where: { userId },
        orderBy: { score: 'desc' },
        select: { score: true },
    });
    return best?.score ?? 0;
};