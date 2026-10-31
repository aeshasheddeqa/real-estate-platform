'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { COMPANY } from '@/lib/company';
import Logo from './Logo';

const links = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact Us' },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const onLogout = async () => {
    await logout();
    setOpen(false);
    router.push('/');
  };

  const linkClass = (href: string) =>
    `rounded px-3 py-2 text-sm font-medium transition ${isActive(href) ? 'text-red-700' : 'text-gray-700 hover:text-red-700'}`;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="hidden bg-gray-900 text-xs text-gray-200 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <span>Real estate since {COMPANY.established}</span>
          <div className="flex items-center gap-4">
            <a href={COMPANY.phoneHref} className="hover:text-white">{COMPANY.phone}</a>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-white">{COMPANY.email}</a>
          </div>
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>{l.label}</Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 text-sm lg:flex">
          <Link href="/dashboard/new" className="rounded bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800">
            Submit Property
          </Link>
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="font-medium text-gray-700 hover:text-red-700">Dashboard</Link>
              <span className="max-w-[8rem] truncate text-gray-500">Hi, {user.name}</span>
              <button onClick={onLogout} className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50">Log out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium text-gray-700 hover:text-red-700">Log in</Link>
              <Link href="/register" className="rounded border border-red-700 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50">Register</Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="space-y-1 border-t border-gray-200 bg-white px-4 pb-4 pt-2 lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`block ${linkClass(l.href)}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/dashboard/new" onClick={() => setOpen(false)} className="block rounded bg-red-700 px-3 py-2 text-center text-sm font-medium text-white">
            Submit Property
          </Link>
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700">Dashboard</Link>
              <button onClick={onLogout} className="block w-full px-3 py-2 text-left text-sm text-gray-700">Log out ({user.name})</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700">Log in</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm font-medium text-red-700">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}