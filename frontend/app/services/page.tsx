import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: `Services | ${COMPANY.name}`,
  description: 'Office space, residential apartments, land and commercial properties, verified before they are listed.',
};

const services = [
  { title: 'Office Space', text: 'Give your business a presence in a prime location with modern working spaces.', href: '/properties?propertyType=commercial' },
  { title: 'Residential Apartments', text: 'Verified listings of apartments for sale, posted by verified owners.', href: '/properties?propertyType=apartment' },
  { title: 'Land', text: 'Buy, sell or rent residential and commercial land in your preferred location.', href: '/properties?propertyType=plot' },
  { title: 'Commercial', text: 'Shops, showrooms, offices and other commercial properties in prime locations.', href: '/properties?propertyType=commercial' },
];

const steps = [
  { n: '1', title: 'Evaluate', text: 'We look at the property, its location and its details.' },
  { n: '2', title: 'Verify', text: 'Ownership and key details are checked before the listing goes live.' },
  { n: '3', title: 'List', text: 'The verified property is published so genuine buyers can find it.' },
];

export default function ServicesPage() {
  return (
    <main>
      <section className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="text-3xl font-bold sm:text-4xl">Our Services</h1>
          <p className="mt-2 text-gray-300">Everything you need to buy, sell or rent property.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="flex flex-col rounded-lg border border-gray-200 border-t-4 border-t-red-700 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">{s.title}</h2>
              <p className="mt-2 flex-1 text-sm text-gray-600">{s.text}</p>
              <Link href={s.href} className="mt-4 text-sm font-medium text-red-700 hover:underline">View properties</Link>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold">How we work</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-lg bg-white p-5 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-700 font-bold text-white">{s.n}</span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}