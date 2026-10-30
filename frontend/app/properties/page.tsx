import type { Metadata } from 'next';
import { API_URL } from '@/lib/api';
import type { SearchResponse } from '@/lib/types';
import FilterBar from '@/components/FilterBar';
import PropertyGrid from '@/components/PropertyGrid';

export const metadata: Metadata = {
  title: 'Properties for sale | RealEstate',
  description: 'Search apartments, villas, houses and plots by city, price and bedrooms.',
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  // keep only plain, non-empty string values
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === 'string' && value) values[key] = value;
  }
  const qs = new URLSearchParams(values);

  const res = await fetch(`${API_URL}/api/properties?${qs.toString()}`, { cache: 'no-store' });

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Properties for sale</h1>
      <FilterBar values={values} />

      {res.ok ? (
        <PropertyGridLoader res={await res.json()} query={qs.toString()} />
      ) : (
        <p className="rounded bg-red-50 p-4 text-sm text-red-700">
          Could not load properties. Check your filters and try again.
        </p>
      )}
    </main>
  );
}

function PropertyGridLoader({ res, query }: { res: SearchResponse; query: string }) {
  return <PropertyGrid initialItems={res.data} initialCursor={res.nextCursor} query={query} />;
}