import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema';
import * as c from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/me', requireAuth, c.me);
router.post('/register', authLimiter, validate(registerSchema), c.register);
router.post('/login', authLimiter, validate(loginSchema), c.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), c.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), c.resetPassword);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
export default router;