'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_URL, parseError } from '@/lib/api';
import PasswordInput from '@/components/PasswordInput';

const labelClass = 'mb-1 block text-sm font-medium text-gray-800';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setError('This reset link is invalid. Please request a new one.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) throw new Error(await parseError(res));
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-6 text-sm text-green-900">
          <p className="font-semibold">Your password was updated.</p>
          <Link href="/login" className="inline-block rounded bg-red-700 px-5 py-2 text-white hover:bg-red-800">Log in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">Set a new password</h1>
      <p className="mb-6 text-sm text-gray-500">Choose a new password for your account.</p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="password" className={labelClass}>
            New password <span className="text-red-600">*</span>
          </label>
          <PasswordInput id="password" required minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirm" className={labelClass}>
            Confirm new password <span className="text-red-600">*</span>
          </label>
          <PasswordInput id="confirm" required minLength={8} maxLength={72} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full rounded bg-red-700 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60">
          {submitting ? 'Saving...' : 'Update password'}
        </button>
        <p className="text-xs text-gray-500"><span className="text-red-600">*</span> Required fields</p>
      </form>
    </main>
  );
}