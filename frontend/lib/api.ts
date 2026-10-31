export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const imageUrl = (path: string | null) => (path ? `${API_URL}${path}` : null);

export const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price));

  export async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors).flat()[0];
      if (typeof first === 'string') return first;
    }
    return body.message || 'Something went wrong';
  } catch {
    return 'Something went wrong';
  }
}