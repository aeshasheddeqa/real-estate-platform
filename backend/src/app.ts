import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

// temporary route to test protection; delete later
app.get('/api/me', requireAuth, (req, res) => res.json({ userId: req.user!.id }));

app.use(errorHandler);
export default app;