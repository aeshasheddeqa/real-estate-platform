'use client';

import { useState } from 'react';
import { COMPANY } from '@/lib/company';

const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700';
const labelClass = 'mb-1 block text-sm font-medium text-gray-800';

type Field = 'name' | 'email' | 'phone' | 'message';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const update = (key: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || '-'}`,
      '',
      form.message,
    ].join('\n');
    window.location.href =
      `mailto:${COMPANY.email}?subject=${encodeURIComponent('Website enquiry from ' + form.name)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Send us a message</h2>
      <div>
        <label htmlFor="c-name" className={labelClass}>Name <span className="text-red-600">*</span></label>
        <input id="c-name" required minLength={2} value={form.name} onChange={update('name')} className={inputClass} />
      </div>
      <div>
        <label htmlFor="c-email" className={labelClass}>Email <span className="text-red-600">*</span></label>
        <input id="c-email" type="email" required value={form.email} onChange={update('email')} className={inputClass} />
      </div>
      <div>
        <label htmlFor="c-phone" className={labelClass}>Phone (optional)</label>
        <input id="c-phone" inputMode="tel" value={form.phone} onChange={update('phone')} className={inputClass} />
      </div>
      <div>
        <label htmlFor="c-message" className={labelClass}>Message <span className="text-red-600">*</span></label>
        <textarea id="c-message" required minLength={10} rows={5} value={form.message} onChange={update('message')} className={inputClass} />
      </div>
      <button type="submit" className="w-full rounded bg-red-700 py-2.5 text-sm font-semibold text-white hover:bg-red-800">Send message</button>
      <p className="text-xs text-gray-500"><span className="text-red-600">*</span> Required fields</p>
    </form>
  );
}