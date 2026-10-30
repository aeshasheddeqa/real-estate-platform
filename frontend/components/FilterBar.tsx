    type Props = { values: Record<string, string> };

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm';

export default function FilterBar({ values }: Props) {
  return (
    <form method="get" action="/properties" className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
      <input name="city" placeholder="City" defaultValue={values.city} className={inputClass} />

      <select name="propertyType" defaultValue={values.propertyType ?? ''} className={inputClass}>
        <option value="">Any type</option>
        {['apartment', 'villa', 'house', 'plot', 'commercial'].map((t) => (
          <option key={t} value={t} className="capitalize">{t}</option>
        ))}
      </select>

      <select name="bedrooms" defaultValue={values.bedrooms ?? ''} className={inputClass}>
        <option value="">Any bedrooms</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n} bedroom{n > 1 ? 's' : ''}</option>
        ))}
      </select>

      <input name="minPrice" type="number" min="0" placeholder="Min price" defaultValue={values.minPrice} className={inputClass} />
      <input name="maxPrice" type="number" min="0" placeholder="Max price" defaultValue={values.maxPrice} className={inputClass} />

      <select name="sort" defaultValue={values.sort ?? 'newest'} className={inputClass}>
        <option value="newest">Newest first</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </select>

      <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
        <button type="submit" className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Search
        </button>
        <a href="/properties" className="rounded border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Reset
        </a>
      </div>
    </form>
  );
}