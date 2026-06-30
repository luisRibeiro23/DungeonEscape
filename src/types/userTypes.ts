import type { User } from '../generated/prisma/client.js';

export type CreateUserDto = Pick<User, 'fullname' | 'email' | 'majorId'>;
export type UpdateUserDto = Pick<User, 'fullname' | 'email' | 'majorId'>;

export type RegisterUserDto = {
    fullname: string;
    email: string;
    password: string;
    confirmPassword: string;
    majorId: string;
};

export type LoginUserDto = {
    email: string;
    password: string;
};