'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const next = new URLSearchParams(window.location.search).get('next');
      // only allow redirects inside this site
      router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        No account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
      </p>
    </main>
  );
}