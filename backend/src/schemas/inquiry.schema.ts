import { z } from 'zod';

export const createInquirySchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be at most 1000 characters')
    .transform((m) => m.replace(/<[^>]*>/g, '').trim()), // strip HTML tags
});