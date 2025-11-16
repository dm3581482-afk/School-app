import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { AuthUser } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'kvs-school-secret-key-change-in-production';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
      house: user.house,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const validateKVSEmail = (userId: string): boolean => {
  return userId.endsWith('@kvs');
};
