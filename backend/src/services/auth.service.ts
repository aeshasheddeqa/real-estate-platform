import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const createAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, env.accessSecret, { expiresIn: '15m' });
};

const createRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, env.refreshSecret, { expiresIn: '7d' });
};

export const registerUser = async (data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}) => {
  // 1. check if email already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [data.email]);
  if (existing.rows.length > 0) {
    throw new AppError(409, 'Email already registered');
  }

  // 2. hash password
  const passwordHash = await bcrypt.hash(data.password, 10);

  // 3. save user
  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone`,
    [data.name, data.email, data.phone || null, passwordHash]
  );
  const user = result.rows[0];

  // 4. create tokens
  return {
    user,
    accessToken: createAccessToken(user.id),
    refreshToken: createRefreshToken(user.id),
  };
};

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) throw new AppError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new AppError(401, 'Invalid email or password');

  return {
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    accessToken: createAccessToken(user.id),
    refreshToken: createRefreshToken(user.id),
  };
};

export const refreshAccessToken = (refreshToken?: string) => {
  if (!refreshToken) throw new AppError(401, 'No refresh token');

  try {
    const payload = jwt.verify(refreshToken, env.refreshSecret) as { id: string };
    return createAccessToken(payload.id);
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }
};

export const getUserById = async (id: string) => {
  const result = await pool.query('SELECT id, name, email, phone FROM users WHERE id = $1', [id]);
  if (result.rows.length === 0) throw new AppError(404, 'User not found');
  return result.rows[0];
};