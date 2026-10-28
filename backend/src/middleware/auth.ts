import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Please login first'));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.accessSecret) as { id: string };
    req.user = { id: payload.id };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
};