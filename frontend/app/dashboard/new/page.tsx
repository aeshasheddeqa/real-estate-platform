'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PropertyForm from '@/components/PropertyForm';

export default function NewPropertyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/dashboard/new');
  }, [loading, user, router]);

  if (loading || !user) return <p className="p-8 text-center text-gray-500">Loading...</p>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Add a property</h1>
      <PropertyForm />
    </main>
  );
}