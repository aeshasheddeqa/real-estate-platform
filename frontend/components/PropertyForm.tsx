'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { parseError } from '@/lib/api';
import type { PropertyDetail } from '@/lib/types';

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-sm font-medium';
const types = ['apartment', 'villa', 'house', 'plot', 'commercial'];

export default function PropertyForm({ property }: { property?: PropertyDetail }) {
  const { authFetch } = useAuth();
  const router = useRouter();
  const editing = !!property;
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);

    // keep only real image files (an empty file input still sends an empty entry)
    const files = (formData.getAll('images') as File[]).filter((f) => f.size > 0);
    if (files.length > 5) {
      setError('You can upload at most 5 images');
      return;
    }
    formData.delete('images');
    files.forEach((f) => formData.append('images', f));
    if (!formData.get('locality')) formData.delete('locality');

    setSubmitting(true);
    // no Content-Type header: the browser sets the multipart boundary itself
    const res = await authFetch(editing ? `/api/properties/${property!.id}` : '/api/properties', {
      method: editing ? 'PUT' : 'POST',
      body: formData,
    });
    setSubmitting(false);

    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError(await parseError(res));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label htmlFor="title" className={labelClass}>Title</label>
        <input id="title" name="title" required minLength={5} maxLength={150} defaultValue={property?.title} className={inputClass} />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>Description (at least 20 characters)</label>
        <textarea id="description" name="description" required minLength={20} maxLength={5000} rows={5} defaultValue={property?.description} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className={labelClass}>City</label>
          <input id="city" name="city" required defaultValue={property?.city} className={inputClass} />
        </div>
        <div>
          <label htmlFor="locality" className={labelClass}>Locality (optional)</label>
          <input id="locality" name="locality" defaultValue={property?.locality ?? ''} className={inputClass} />
        </div>
        <div>
          <label htmlFor="price" className={labelClass}>Price (INR)</label>
          <input id="price" name="price" type="number" required min={1} defaultValue={property ? String(Number(property.price)) : ''} className={inputClass} />
        </div>
        <div>
          <label htmlFor="propertyType" className={labelClass}>Type</label>
          <select id="propertyType" name="propertyType" defaultValue={property?.propertyType ?? 'apartment'} className={inputClass}>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bedrooms" className={labelClass}>Bedrooms</label>
          <input id="bedrooms" name="bedrooms" type="number" required min={0} max={20} defaultValue={property?.bedrooms ?? 0} className={inputClass} />
        </div>
        <div>
          <label htmlFor="bathrooms" className={labelClass}>Bathrooms</label>
          <input id="bathrooms" name="bathrooms" type="number" required min={0} max={20} defaultValue={property?.bathrooms ?? 0} className={inputClass} />
        </div>
        <div>
          <label htmlFor="areaSqft" className={labelClass}>Area (sqft)</label>
          <input id="areaSqft" name="areaSqft" type="number" required min={1} defaultValue={property?.areaSqft} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="images" className={labelClass}>
          Images (JPG, PNG or WEBP, up to 5, 5 MB each){editing ? ' - choosing new images replaces the old ones' : ''}
        </label>
        <input id="images" name="images" type="file" multiple accept="image/jpeg,image/png,image/webp" className="text-sm" />
      </div>

      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={submitting} className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
        {submitting ? 'Saving...' : editing ? 'Save changes' : 'Create property'}
      </button>
    </form>
  );
}