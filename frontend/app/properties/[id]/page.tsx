import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { API_URL, formatPrice, imageUrl } from '@/lib/api';
import type { PropertyDetail, PropertySummary } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import InquiryForm from '@/components/InquiryForm';

// ISR: the page is cached and refreshed at most once an hour
const REVALIDATE_SECONDS = 60;

async function getProperty(id: string): Promise<PropertyDetail | null> {
  const res = await fetch(`${API_URL}/api/properties/${id}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error('Failed to load property');
  return res.json();
}

async function getSimilar(id: string): Promise<PropertySummary[]> {
  const res = await fetch(`${API_URL}/api/properties/${id}/similar`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) return [];
  return res.json();
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: 'Property not found' };

  const title = `${property.title} | ${formatPrice(property.price)}`;
  const description = property.description.slice(0, 155);
  const image = imageUrl(property.images[0] ?? null);

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', images: image ? [image] : [] },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const similar = await getSimilar(id);
  const images = property.images.map((p) => imageUrl(p)).filter((u): u is string => !!u);

  // structured data helps search engines understand the listing
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    image: images,
    datePosted: property.createdAt,
    offers: { '@type': 'Offer', price: property.price, priceCurrency: 'INR' },
    address: { '@type': 'PostalAddress', addressLocality: property.city, addressCountry: 'IN' },
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <nav className="text-sm text-gray-500">
        <Link href="/properties" className="hover:underline">Properties</Link> / {property.city}
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          {images.length > 0 ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[0]} alt={property.title} className="h-80 w-full rounded-lg object-cover" />
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1).map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt={property.title} className="h-24 w-full rounded object-cover" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              No images uploaded
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-500">
            {property.locality ? `${property.locality}, ` : ''}{property.city}
          </p>

          <ul className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm sm:grid-cols-4">
            <li><span className="block text-gray-500">Type</span><span className="font-medium capitalize">{property.propertyType}</span></li>
            <li><span className="block text-gray-500">Bedrooms</span><span className="font-medium">{property.bedrooms}</span></li>
            <li><span className="block text-gray-500">Bathrooms</span><span className="font-medium">{property.bathrooms}</span></li>
            <li><span className="block text-gray-500">Area</span><span className="font-medium">{property.areaSqft} sqft</span></li>
          </ul>

          <div>
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-line text-gray-700">{property.description}</p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{formatPrice(property.price)}</p>
            <p className="mt-1 text-sm text-gray-500">Listed by {property.ownerName}</p>
          </div>
          {/* the inquiry form goes here (next step)
          <div id="inquiry" /> */}
          <InquiryForm propertyId={property.id} ownerId={property.owner_id} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Similar properties</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}