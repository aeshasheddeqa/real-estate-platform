import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { env } from '../config/env';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(
      req.body.email,
      req.body.password
    );
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ user, accessToken });
  } catch (error) {
    next(error);
  }
};

export const refresh = (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = authService.refreshAccessToken(req.cookies.refreshToken);
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.status(204).send();
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await authService.getUserById(req.user!.id));
  } catch (error) {
    next(error);
  }
};