import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = {
  title: `About Us | ${COMPANY.name}`,
  description: COMPANY.about,
};

const values = [
  { title: 'Verified listings', text: 'We evaluate, verify and list properties before they go live.' },
  { title: 'Transparent services', text: 'Clear information about every property, so buyers and sellers know where they stand.' },
  { title: 'Long-term value', text: 'Properties and opportunities chosen with long-term value in mind.' },
];

export default function AboutPage() {
  return (
    <main>
      <section className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="text-3xl font-bold sm:text-4xl">About Us</h1>
          <p className="mt-2 text-gray-300">{COMPANY.name}, real estate since {COMPANY.established}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-lg leading-relaxed text-gray-700">{COMPANY.about}</p>
        <p className="mt-4 leading-relaxed text-gray-700">
  We help people buy, sell and rent apartments, houses, plots and commercial spaces.
</p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-lg border border-gray-200 border-t-4 border-t-red-700 bg-white p-5 shadow-sm">
              <h3 className="font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/properties" className="rounded bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800">Browse properties</Link>
          <Link href="/contact" className="rounded border border-red-700 px-6 py-3 text-sm font-semibold text-red-700 hover:bg-red-50">Contact us</Link>
        </div>
      </section>
    </main>
  );
}