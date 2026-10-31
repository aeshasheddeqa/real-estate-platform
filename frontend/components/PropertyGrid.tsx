'use client';

import { useState } from 'react';
import type { PropertySummary, SearchResponse } from '@/lib/types';
import { API_URL } from '@/lib/api';
import PropertyCard from './PropertyCard';

type Props = {
  initialItems: PropertySummary[];
  initialCursor: string | null;
  query: string; // current filters, without the cursor
};

export default function PropertyGrid({ initialItems, initialCursor, query }: Props) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMore = async () => {
    if (!cursor) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(query);
      params.set('cursor', cursor);
      const res = await fetch(`${API_URL}/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error('Could not load more properties');
      const page: SearchResponse = await res.json();
      setItems((prev) => [...prev, ...page.data]);
      setCursor(page.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return <p className="py-16 text-center text-gray-500">No properties match your search.</p>;
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>

      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

      {cursor && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}