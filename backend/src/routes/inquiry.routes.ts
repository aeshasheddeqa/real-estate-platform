import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { inquiryLimiter } from '../middleware/rateLimiter';
import { createInquirySchema } from '../schemas/inquiry.schema';
import * as c from '../controllers/inquiry.controller';

const router = Router();

router.post('/properties/:id/inquiries', requireAuth, inquiryLimiter, validate(createInquirySchema), c.create);
router.get('/inquiries/received', requireAuth, c.received);
router.get('/inquiries/sent', requireAuth, c.sent);

export default router;