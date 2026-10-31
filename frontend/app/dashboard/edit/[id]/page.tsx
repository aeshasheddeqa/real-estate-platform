'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/api';
import type { PropertyDetail } from '@/lib/types';
import PropertyForm from '@/components/PropertyForm';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=/dashboard/edit/${id}`);
  }, [loading, user, router, id]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await fetch(`${API_URL}/api/properties/${id}`);
      if (!res.ok) {
        setError('Property not found');
        return;
      }
      const data: PropertyDetail = await res.json();
      if (data.owner_id !== user.id) {
        setError('You can only edit your own properties');
        return;
      }
      setProperty(data);
    })();
  }, [user, id]);

  if (loading || !user) return <p className="p-8 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!property) return <p className="p-8 text-center text-gray-500">Loading property...</p>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit property</h1>
      <PropertyForm property={property} />
    </main>
  );
}