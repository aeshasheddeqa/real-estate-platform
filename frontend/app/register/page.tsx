'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // an empty phone must not be sent, the API expects 10 digits or nothing
      await register({ name, email, password, ...(phone ? { phone } : {}) });
      router.push('/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Create an account</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
          <input id="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone (optional, 10 digits)</label>
          <input id="phone" inputMode="numeric" pattern="[0-9]{10}" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password (min 8 characters)</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already registered? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
      </p>
    </main>
  );
}