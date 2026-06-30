import type { Major } from '../generated/prisma/client.js';

export type CreateMajorDto = Pick<Major, 'name' | 'code' | 'description'>;
export type UpdateMajorDto = Pick<Major, 'name' | 'code' | 'description'>;