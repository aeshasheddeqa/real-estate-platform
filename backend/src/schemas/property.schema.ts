import { z } from 'zod';

export const propertyTypes = ['apartment', 'villa', 'house', 'plot', 'commercial'] as const;

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

export const searchSchema = z.object({
  city: z.string().trim().min(1).optional(),
  propertyType: z.enum(propertyTypes).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export type SearchQuery = z.infer<typeof searchSchema>;
export const mineSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});