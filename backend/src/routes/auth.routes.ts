import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import * as c from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/me', requireAuth, c.me);
router.post('/register', authLimiter, validate(registerSchema), c.register);
router.post('/login', authLimiter, validate(loginSchema), c.login);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
export default router;