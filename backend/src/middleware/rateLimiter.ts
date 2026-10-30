import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts, try again later' },
});

export const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                   // 5 inquiries per user per hour
  keyGenerator: (req) => req.user!.id, // limit per logged-in user, not per IP
  message: { message: 'Too many inquiries, please try again later' },
});