import Link from 'next/link';
import { COMPANY } from '@/lib/company';

export default function Logo({ light = false }: { light?: boolean }) {
  // "Real Estate Groups" becomes a big "REAL ESTATE" and a small "GROUPS"
  const words = COMPANY.name.split(' ');
  const last = words.length > 1 ? words.pop() : '';
  const first = words.join(' ');

  return (
    <Link href="/" className="flex items-center gap-2" aria-label={COMPANY.name}>
      <span className="flex h-10 w-10 items-center justify-center rounded bg-red-700 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className={`block text-lg font-extrabold uppercase tracking-wide ${light ? 'text-white' : 'text-gray-900'}`}>{first}</span>
        {last && <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-red-600">{last}</span>}
      </span>
    </Link>
  );
}