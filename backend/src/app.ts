import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(errorHandler);
export default app;


// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import cookieParser from 'cookie-parser';
// import { env } from './config/env';
// import authRoutes from './routes/auth.routes';
// import { requireAuth } from './middleware/auth';
// import { errorHandler } from './middleware/errorHandler';
// import path from 'path';
// import propertyRoutes from './routes/property.routes';

// const app = express();

// app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// app.use(cors({ origin: env.clientUrl, credentials: true }));
// app.use(express.json({ limit: '10kb' }));
// app.use(cookieParser());

// app.get('/health', (_req, res) => res.json({ status: 'ok' }));
// app.use('/api/auth', authRoutes);

// app.use('/api/properties', propertyRoutes);
// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// // temporary route to test protection; delete later
// app.get('/api/me', requireAuth, (req, res) => res.json({ userId: req.user!.id }));

// app.use(errorHandler);
// export default app;

