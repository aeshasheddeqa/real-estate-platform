import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import * as c from '../controllers/auth.controller';

const router = Router();
router.post('/register', authLimiter, validate(registerSchema), c.register);
router.post('/login', authLimiter, validate(loginSchema), c.login);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
export default router;