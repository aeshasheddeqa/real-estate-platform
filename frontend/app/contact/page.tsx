import type { Metadata } from 'next';
import { COMPANY } from '@/lib/company';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: `Contact Us | ${COMPANY.name}`,
  description: `Contact ${COMPANY.name} in  Chennai. Call ${COMPANY.phone} or send us a message.`,
};

export default function ContactPage() {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.address)}`;

  return (
    <main>
      <section className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h1 className="text-3xl font-bold sm:text-4xl">Contact Us</h1>
          <p className="mt-2 text-gray-300">Get in touch with us</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Office address</h2>
            <p className="mt-2 text-sm text-gray-600">{COMPANY.address}</p>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-red-700 hover:underline">Open in Google Maps</a>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Phone</h2>
            <a href={COMPANY.phoneHref} className="mt-2 block text-sm text-gray-600 hover:text-red-700">{COMPANY.phone}</a>
            <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-red-700 hover:underline">Chat on WhatsApp</a>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Email</h2>
            <a href={`mailto:${COMPANY.email}`} className="mt-2 block text-sm text-gray-600 hover:text-red-700">{COMPANY.email}</a>
          </div>
        </div>

        <ContactForm />
      </section>
    </main>
  );
}