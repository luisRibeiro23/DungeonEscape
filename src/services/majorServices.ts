import prisma from '../prisma/prisma-client.js';
import type { Major } from '../generated/prisma/client.js';
import type { CreateMajorDto, UpdateMajorDto } from '../types/majorTypes.js';

export const getAllMajors = async (): Promise<Major[]> => {
    return prisma.major.findMany({ orderBy: { name: 'asc' } });
};

export const getMajor = async (id: string): Promise<Major | null> => {
    return prisma.major.findFirst({ where: { id } });
};

export const majorAlreadyExists = async (name: string): Promise<boolean> => {
    return !!(await prisma.major.findFirst({ where: { name } }));
};

export const createMajor = async (data: CreateMajorDto): Promise<Major> => {
    return prisma.major.create({ data });
};

export const updateMajor = async (
    id: string,
    data: UpdateMajorDto,
): Promise<[affectedCount: number]> => {
    const result = await prisma.major.updateMany({ where: { id }, data });
    return [result.count];
};

export const removeMajor = async (id: string): Promise<number> => {
    const result = await prisma.major.deleteMany({ where: { id } });
    return result.count;
};