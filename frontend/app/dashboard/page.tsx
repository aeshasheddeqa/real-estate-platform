'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, imageUrl } from '@/lib/api';

const PAGE_SIZE = 3;

type MyProperty = {
  id: string;
  title: string;
  city: string;
  price: string;
  images: string[];
};

type MinePage = { data: MyProperty[]; nextCursor: string | null };

type ReceivedInquiry = {
  id: string;
  message: string;
  createdAt: string;
  propertyId: string;
  propertyTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
};

export default function DashboardPage() {
  const { user, loading, authFetch } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<MyProperty[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<ReceivedInquiry[]>([]);
  const [busy, setBusy] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // protect the page: send visitors who are not logged in to the login page
  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/dashboard');
  }, [loading, user, router]);

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const [p, i] = await Promise.all([
        authFetch(`/api/properties/mine?limit=${PAGE_SIZE}`),
        authFetch('/api/inquiries/received'),
      ]);
      if (!p.ok || !i.ok) throw new Error('Could not load your dashboard');
      const page: MinePage = await p.json();
      setProperties(page.data);
      setNextCursor(page.nextCursor);
      setInquiries(await i.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    setError('');
    const res = await authFetch(
      `/api/properties/mine?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(nextCursor)}`
    );
    setLoadingMore(false);
    if (!res.ok) {
      setError('Could not load more properties');
      return;
    }
    const page: MinePage = await res.json();
    setProperties((prev) => [...prev, ...page.data]);
    setNextCursor(page.nextCursor);
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await authFetch(`/api/properties/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } else {
      setError('Could not delete the property');
    }
  };

  if (loading || !user) return <p className="p-8 text-center text-gray-500">Loading...</p>;

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My properties</h1>
          <Link href="/dashboard/new" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + Add property
          </Link>
        </div>

        {error && <p className="mb-3 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {busy ? (
          <p className="text-gray-500">Loading...</p>
        ) : properties.length === 0 ? (
          <p className="rounded border border-dashed border-gray-300 p-8 text-center text-gray-500">
            You have not listed any property yet.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
              {properties.map((p) => {
                const img = imageUrl(p.images[0] ?? null);
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt="" className="h-16 w-24 rounded object-cover" />
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">No image</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <Link href={`/properties/${p.id}`} className="block truncate font-medium hover:underline">{p.title}</Link>
                      <p className="text-sm text-gray-500">{p.city} · {formatPrice(p.price)}</p>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <Link href={`/dashboard/edit/${p.id}`} className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50">Edit</Link>
                      <button onClick={() => remove(p.id, p.title)} className="rounded border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {nextCursor && (
              <div className="mt-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Inquiries received</h2>
        {busy ? null : inquiries.length === 0 ? (
          <p className="rounded border border-dashed border-gray-300 p-8 text-center text-gray-500">
            No inquiries yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {inquiries.map((q) => (
              <li key={q.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <Link href={`/properties/${q.propertyId}`} className="font-medium hover:underline">{q.propertyTitle}</Link>
                  <span className="text-gray-400">{new Date(q.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{q.message}</p>
                <p className="mt-2 text-xs text-gray-500">
                  From {q.senderName} · {q.senderEmail}{q.senderPhone ? ` · ${q.senderPhone}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}