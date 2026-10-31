'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { parseError } from '@/lib/api';

export default function InquiryForm({ propertyId, ownerId }: { propertyId: string; ownerId: string }) {
  const { user, loading, authFetch } = useAuth();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  if (loading) return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />;

  if (!user) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
        <Link href={`/login?next=/properties/${propertyId}`} className="font-medium text-red-700 hover:underline">
          Log in
        </Link>{' '}
        to send an inquiry to the owner.
      </div>
    );
  }

  if (user.id === ownerId) {
    return <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">This is your listing.</p>;
  }

  if (status === 'sent') {
    return <p className="rounded-lg bg-green-50 p-5 text-sm text-green-800">Your inquiry was sent to the owner.</p>;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('sending');
    const res = await authFetch(`/api/properties/${propertyId}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (res.ok) {
      setStatus('sent');
    } else {
      setError(await parseError(res));
      setStatus('idle');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="font-semibold">Contact the owner</h2>
      <textarea
        required
        minLength={10}
        maxLength={1000}
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Hi, is this property still available?"
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
      />
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded bg-red-700 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending...' : 'Send inquiry'}
      </button>
    </form>
  );
}