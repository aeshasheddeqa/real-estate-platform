'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PasswordInput from '@/components/PasswordInput';

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700';
const labelClass = 'mb-1 block text-sm font-medium text-gray-800';

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
      <h1 className="mb-1 text-2xl font-bold">Welcome back</h1>
      <p className="mb-6 text-sm text-gray-500">Log in to manage your properties and inquiries.</p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email <span className="text-red-600">*</span>
          </label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password <span className="text-red-600">*</span>
          </label>
          <PasswordInput id="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-sm text-red-700 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={submitting} className="w-full rounded bg-red-700 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60">
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
        <p className="text-xs text-gray-500"><span className="text-red-600">*</span> Required fields</p>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        No account? <Link href="/register" className="text-red-700 hover:underline">Register</Link>
      </p>
    </main>
  );
}