import { z } from 'zod';

const propertyTypes = ['apartment', 'villa', 'house', 'plot', 'commercial'] as const;

export const createPropertySchema = z.object({
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(20).max(5000),
  city: z.string().trim().min(2).max(80),
  locality: z.string().trim().max(120).optional(),
  price: z.coerce.number().positive(),
  propertyType: z.enum(propertyTypes),
  bedrooms: z.coerce.number().int().min(0).max(20).default(0),
  bathrooms: z.coerce.number().int().min(0).max(20).default(0),
  areaSqft: z.coerce.number().int().positive(),
});

export const updatePropertySchema = createPropertySchema.partial();