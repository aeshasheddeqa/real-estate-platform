import { pool } from '../config/db';

const cities = ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Kolkata', 'Coimbatore'];
const localities = ['Anna Nagar', 'Adyar', 'Whitefield', 'Andheri', 'Gachibowli', 'Kothrud', 'Salt Lake', 'Velachery', 'Indiranagar', 'Powai'];
const types = ['apartment', 'villa', 'house', 'plot', 'commercial'];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const TOTAL = 50000;
const BATCH = 1000;

const run = async () => {
  const owner = await pool.query('SELECT id FROM users ORDER BY created_at LIMIT 1');
  if (owner.rows.length === 0) throw new Error('Register a user first');
  const ownerId = owner.rows[0].id;

  for (let done = 0; done < TOTAL; done += BATCH) {
    const titles: string[] = [], descs: string[] = [], citiesArr: string[] = [], locs: string[] = [];
    const prices: number[] = [], typesArr: string[] = [], beds: number[] = [], baths: number[] = [];
    const areas: number[] = [], dates: Date[] = [];

    for (let i = 0; i < BATCH; i++) {
      const type = pick(types);
      const city = pick(cities);
      const locality = pick(localities);
      const bedrooms = type === 'plot' || type === 'commercial' ? 0 : rand(1, 5);
      titles.push(`${type.charAt(0).toUpperCase() + type.slice(1)} in ${locality}, ${city}`);
      descs.push(`Well maintained ${type} located in ${locality}, ${city}, close to schools, markets and public transport.`);
      citiesArr.push(city);
      locs.push(locality);
      prices.push(rand(10, 400) * 100000);
      typesArr.push(type);
      beds.push(bedrooms);
      baths.push(bedrooms === 0 ? 0 : rand(1, bedrooms));
      areas.push(rand(400, 4000));
      dates.push(new Date(Date.now() - rand(0, 730) * 24 * 60 * 60 * 1000 - rand(0, 86400000)));
    }

    await pool.query(
      `INSERT INTO properties
        (owner_id, title, description, city, locality, price, property_type, bedrooms, bathrooms, area_sqft, created_at)
       SELECT $1, t.title, t.description, t.city, t.locality, t.price, t.ptype, t.bedrooms, t.bathrooms, t.area, t.created_at
       FROM unnest($2::text[], $3::text[], $4::text[], $5::text[], $6::numeric[], $7::text[],
                   $8::int[], $9::int[], $10::int[], $11::timestamptz[])
         AS t(title, description, city, locality, price, ptype, bedrooms, bathrooms, area, created_at)`,
      [ownerId, titles, descs, citiesArr, locs, prices, typesArr, beds, baths, areas, dates]
    );
    console.log(`Inserted ${done + BATCH} / ${TOTAL}`);
  }
  await pool.end();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});