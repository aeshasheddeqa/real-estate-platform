import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env variable: ${key}`);
  return v;
};

export const env = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: required('DATABASE_URL'),
  accessSecret: required('JWT_ACCESS_SECRET'),
  refreshSecret: required('JWT_REFRESH_SECRET'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  isProd: process.env.NODE_ENV === 'production',
};