'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_URL, parseError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await parseError(res));
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">Forgot your password?</h1>
      <p className="mb-6 text-sm text-gray-500">Enter your email and we will send you a link to reset it.</p>

      {sent ? (
        <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-6 text-sm text-green-900">
          <p>If an account exists for <strong>{email}</strong>, a password reset link has been sent. The link is valid for 30 minutes.</p>
          <Link href="/login" className="inline-block font-medium text-red-700 hover:underline">Back to log in</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-800">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700"
            />
          </div>
          {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full rounded bg-red-700 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60">
            {submitting ? 'Sending...' : 'Send reset link'}
          </button>
          <p className="text-xs text-gray-500"><span className="text-red-600">*</span> Required fields</p>
        </form>
      )}

      {!sent && (
        <p className="mt-4 text-center text-sm text-gray-600">
          Remembered it? <Link href="/login" className="text-red-700 hover:underline">Log in</Link>
        </p>
      )}
    </main>
  );
}