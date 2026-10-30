export type PropertySummary = {
  id: string;
  title: string;
  city: string;
  locality: string | null;
  price: string; // PostgreSQL NUMERIC arrives as a string
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  image: string | null;
  createdAt: string;
};

export type SearchResponse = {
  data: PropertySummary[];
  nextCursor: string | null;
  limit: number;
};