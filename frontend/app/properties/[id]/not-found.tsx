import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Property not found</h1>
      <p className="mt-2 text-gray-500">It may have been removed or the link is wrong.</p>
      <Link href="/properties" className="mt-6 inline-block rounded bg-red-700 px-5 py-2 text-sm text-white">
        Back to listings
      </Link>
    </main>
  );
}