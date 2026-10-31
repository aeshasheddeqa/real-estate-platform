'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    await logout();
    router.push('/properties');
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/properties" className="text-lg font-bold text-blue-600">RealEstate</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/properties" className="text-gray-700 hover:text-blue-600">Properties</Link>
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
              <span className="text-gray-500">Hi, {user.name}</span>
              <button onClick={onLogout} className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">Log in</Link>
              <Link href="/register" className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}