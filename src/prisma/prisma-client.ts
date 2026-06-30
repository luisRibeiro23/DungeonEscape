import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
    host: 'localhost',
    user: 'dungeon',
    password: 'senha123',
    database: 'dungeonescape',
});

const prisma = new PrismaClient({ adapter });

export default prisma;