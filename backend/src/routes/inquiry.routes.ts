import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validate';
import { createInquirySchema, listInquiriesSchema } from '../schemas/inquiry.schema';
import { inquiryLimiter } from '../middleware/rateLimiter';
import * as c from '../controllers/inquiry.controller';

const router = Router();

router.post('/properties/:id/inquiries', requireAuth, inquiryLimiter, validate(createInquirySchema), c.create);
router.get('/inquiries/received', requireAuth, validateQuery(listInquiriesSchema), c.received);
router.get('/inquiries/sent', requireAuth, c.sent);

export default router;