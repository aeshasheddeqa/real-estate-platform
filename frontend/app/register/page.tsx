'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PasswordInput from '@/components/PasswordInput';

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700';
const labelClass = 'mb-1 block text-sm font-medium text-gray-800';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      // an empty phone must not be sent, the API expects 10 digits or nothing
      await register({ name, email, password, ...(phone ? { phone } : {}) });
      const next = new URLSearchParams(window.location.search).get('next');
      router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">Create your account</h1>
      <p className="mb-6 text-sm text-gray-500">Register to list properties and contact owners.</p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="name" className={labelClass}>
            Full name <span className="text-red-600">*</span>
          </label>
          <input id="name" required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email <span className="text-red-600">*</span>
          </label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Phone (optional, 10 digits)</label>
          <input id="phone" inputMode="numeric" pattern="[0-9]{10}" title="Enter a 10 digit phone number" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password <span className="text-red-600">*</span>
          </label>
          <PasswordInput id="password" required minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
        </div>

        <div>
          <label htmlFor="confirm" className={labelClass}>
            Confirm password <span className="text-red-600">*</span>
          </label>
          <PasswordInput id="confirm" required minLength={8} maxLength={72} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>

        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={submitting} className="w-full rounded bg-red-700 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60">
          {submitting ? 'Creating account...' : 'Register'}
        </button>
        <p className="text-xs text-gray-500"><span className="text-red-600">*</span> Required fields</p>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already registered? <Link href="/login" className="text-red-700 hover:underline">Log in</Link>
      </p>
    </main>
  );
}