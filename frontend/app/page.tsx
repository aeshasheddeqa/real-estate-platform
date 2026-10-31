import type { Metadata } from 'next';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import type { PropertySummary, SearchResponse } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: `${COMPANY.name} | Verified Properties in Chennai`,
  description: 'Search verified apartments, villas, houses, plots and commercial properties in Chennai.',
};

const categories = [
  { title: 'Residential Apartments', text: 'Verified apartments for sale from genuine owners.', href: '/properties?propertyType=apartment' },
  { title: 'Villas and Houses', text: 'Independent homes for families who want more space.', href: '/properties?propertyType=villa' },
  { title: 'Land and Plots', text: 'Residential and commercial plots in prime locations.', href: '/properties?propertyType=plot' },
  { title: 'Commercial and Office Space', text: 'Shops, showrooms and offices in business locations.', href: '/properties?propertyType=commercial' },
];

async function getRecent(): Promise<PropertySummary[]> {
  try {
    const res = await fetch(`${API_URL}/api/properties?limit=8`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const page: SearchResponse = await res.json();
    return page.data;
  } catch {
    return []; // the API is not reachable: hide the section instead of crashing
  }
}

const fieldClass = 'w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900';

export default async function HomePage() {
  const recent = await getRecent();

  return (
    <main>
      <section className="bg-gradient-to-r from-red-900 via-red-800 to-red-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-200">Real estate since {COMPANY.established}</p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">Find a verified home in Chennai</h1>
          <p className="mt-4 max-w-xl text-red-100">We evaluate, verify and list properties, so you can buy with confidence.</p>

          <form method="get" action="/properties" className="mt-8 grid max-w-3xl gap-3 rounded-lg bg-white/95 p-4 shadow-lg sm:grid-cols-4">
            <input name="city" placeholder="City or area" className={`${fieldClass} sm:col-span-2`} />
            <select name="propertyType" defaultValue="" className={fieldClass}>
              <option value="">Any type</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="house">House</option>
              <option value="plot">Land / Plot</option>
              <option value="commercial">Commercial</option>
            </select>
            <button type="submit" className="rounded bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800">Search</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-bold">What are you looking for?</h2>
        <p className="mt-1 text-gray-500">Browse by property type.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.title} href={c.href} className="group rounded-lg border border-gray-200 border-t-4 border-t-red-700 bg-white p-5 shadow-sm transition hover:shadow-md">
              <h3 className="font-semibold group-hover:text-red-700">{c.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{c.text}</p>
              <span className="mt-4 inline-block text-sm font-medium text-red-700">View properties</span>
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recent properties</h2>
              <p className="mt-1 text-gray-500">The latest listings on our platform.</p>
            </div>
            <Link href="/properties" className="text-sm font-medium text-red-700 hover:underline">View all</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-red-700 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Looking to sell or rent your property?</h2>
            <p className="mt-1 text-red-100">List it with us and reach genuine buyers.</p>
          </div>
          <Link href="/dashboard/new" className="rounded bg-white px-6 py-3 text-sm font-semibold text-red-700 hover:bg-red-50">Submit Property</Link>
        </div>
      </section>
    </main>
  );
}