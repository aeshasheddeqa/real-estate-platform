export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const imageUrl = (path: string | null) => (path ? `${API_URL}${path}` : null);

export const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price));