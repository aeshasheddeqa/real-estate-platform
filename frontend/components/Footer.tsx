import Link from 'next/link';
import { COMPANY } from '@/lib/company';
import Logo from './Logo';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact Us' },
];

const types = [
  { href: '/properties?propertyType=apartment', label: 'Apartments' },
  { href: '/properties?propertyType=villa', label: 'Villas' },
  { href: '/properties?propertyType=house', label: 'Houses' },
  { href: '/properties?propertyType=plot', label: 'Land and Plots' },
  { href: '/properties?propertyType=commercial', label: 'Commercial' },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <h3 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-white">About Us</h3>
          <p className="text-sm leading-relaxed">{COMPANY.about}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Property Types</h3>
          <ul className="space-y-2 text-sm">
            {types.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li>{COMPANY.address}</li>
            <li>Phone: <a href={COMPANY.phoneHref} className="hover:text-white">{COMPANY.phone}</a></li>
            <li>Email: <a href={`mailto:${COMPANY.email}`} className="hover:text-white">{COMPANY.email}</a></li>
            <li><a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-white">Chat on WhatsApp</a></li>
          </ul>
          <div className="mt-4 flex gap-4 text-sm">
            <a href={COMPANY.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a>
            <a href={COMPANY.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
            <a href={COMPANY.social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-white">YouTube</a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl space-y-2 px-4 py-5 text-xs text-gray-400">
          <p>
            Disclaimer: {COMPANY.name} only provides a platform to advertise properties and is not a party to any transaction between a seller and a buyer. Prices and details are supplied by the advertisers.
          </p>
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. This website is a demo project built for a technical evaluation.
          </p>
        </div>
      </div>
    </footer>
  );
}