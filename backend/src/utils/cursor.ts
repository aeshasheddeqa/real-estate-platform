import { AppError } from './AppError';
import { UUID_REGEX } from './uuid';

export const encodeCursor = (value: string, id: string) =>
  Buffer.from(JSON.stringify({ v: value, id })).toString('base64url');

export const decodeCursor = (cursor: string): { v: string; id: string } => {
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
    if (typeof decoded.v !== 'string' || !UUID_REGEX.test(decoded.id)) throw new Error('bad cursor');
    return decoded;
  } catch {
    throw new AppError(400, 'Invalid cursor');
  }
};