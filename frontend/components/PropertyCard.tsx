import Link from 'next/link';
import type { PropertySummary } from '@/lib/types';
import { formatPrice, imageUrl } from '@/lib/api';

export default function PropertyCard({ property }: { property: PropertySummary }) {
  const img = imageUrl(property.image);
  return (
    <Link
      href={`/properties/${property.id}`}
      className="block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={property.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
          No image
        </div>
      )}
      <div className="space-y-1 p-4">
        <p className="text-lg font-semibold text-gray-900">{formatPrice(property.price)}</p>
        <h3 className="truncate text-sm font-medium text-gray-800">{property.title}</h3>
        <p className="text-sm text-gray-500">
          {property.locality ? `${property.locality}, ` : ''}
          {property.city}
        </p>
        <p className="text-xs text-gray-500">
          {property.bedrooms} bed · {property.bathrooms} bath · {property.areaSqft} sqft ·{' '}
          <span className="capitalize">{property.propertyType}</span>
        </p>
      </div>
    </Link>
  );
}