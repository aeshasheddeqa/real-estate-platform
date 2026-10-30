import { pool } from '../config/db';
import { AppError } from '../utils/AppError';
import { SearchQuery } from '../schemas/property.schema';
import { UUID_REGEX } from '../utils/uuid';

const columns = `id, owner_id, title, description, city, locality, price,
  property_type AS "propertyType", bedrooms, bathrooms,
  area_sqft AS "areaSqft", images, created_at AS "createdAt"`;

export const createProperty = async (ownerId: string, data: any, images: string[]) => {
  const result = await pool.query(
    `INSERT INTO properties
      (owner_id, title, description, city, locality, price, property_type, bedrooms, bathrooms, area_sqft, images)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING ${columns}`,
    [ownerId, data.title, data.description, data.city, data.locality || null,
     data.price, data.propertyType, data.bedrooms, data.bathrooms, data.areaSqft, images]
  );
  return result.rows[0];
};

export const getPropertyById = async (id: string) => {
  if (!UUID_REGEX.test(id)) throw new AppError(400, 'Invalid property id');

  const result = await pool.query(
    `SELECT p.id, p.owner_id, p.title, p.description, p.city, p.locality, p.price,
            p.property_type AS "propertyType", p.bedrooms, p.bathrooms,
            p.area_sqft AS "areaSqft", p.images, p.created_at AS "createdAt",
            u.name AS "ownerName"
     FROM properties p JOIN users u ON u.id = p.owner_id
     WHERE p.id = $1`,
    [id]
  );
  if (result.rows.length === 0) throw new AppError(404, 'Property not found');
  return result.rows[0];
};
// ownership check: used before update and delete
const assertOwner = async (propertyId: string, userId: string) => {
  const result = await pool.query('SELECT owner_id FROM properties WHERE id = $1', [propertyId]);
  if (result.rows.length === 0) throw new AppError(404, 'Property not found');
  if (result.rows[0].owner_id !== userId) throw new AppError(403, 'You can only change your own properties');
};

export const updateProperty = async (id: string, userId: string, data: any, newImages: string[]) => {
  await assertOwner(id, userId);

  const map: Record<string, string> = {
    title: 'title', description: 'description', city: 'city', locality: 'locality',
    price: 'price', propertyType: 'property_type', bedrooms: 'bedrooms',
    bathrooms: 'bathrooms', areaSqft: 'area_sqft',
  };

  const sets: string[] = [];
  const values: any[] = [];
  Object.keys(map).forEach((key) => {
    if (data[key] !== undefined) {
      values.push(data[key]);
      sets.push(`${map[key]} = $${values.length}`);
    }
  });
  if (newImages.length > 0) {
    values.push(newImages);
    sets.push(`images = $${values.length}`);
  }
  if (sets.length === 0) throw new AppError(400, 'Nothing to update');

  sets.push('updated_at = NOW()');
  values.push(id);
  const result = await pool.query(
    `UPDATE properties SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING ${columns}`,
    values
  );
  return result.rows[0];
};

export const deleteProperty = async (id: string, userId: string) => {
  await assertOwner(id, userId);
  await pool.query('DELETE FROM properties WHERE id = $1', [id]);
};

export const getMyProperties = async (userId: string) => {
  const result = await pool.query(
    `SELECT ${columns} FROM properties WHERE owner_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const SORTS = {
  newest: { column: 'p.created_at', dir: 'DESC', cast: 'timestamptz' },
  price_asc: { column: 'p.price', dir: 'ASC', cast: 'numeric' },
  price_desc: { column: 'p.price', dir: 'DESC', cast: 'numeric' },
} as const;

export const searchProperties = async (q: SearchQuery) => {
  const where: string[] = [];
  const values: any[] = [];

  // adds a condition and its value; ? becomes $1, $2, ...
  const add = (sql: string, value: any) => {
    values.push(value);
    where.push(sql.replace('?', `$${values.length}`));
  };

  if (q.city) add('LOWER(p.city) = LOWER(?)', q.city);
  if (q.propertyType) add('p.property_type = ?', q.propertyType);
  if (q.bedrooms !== undefined) add('p.bedrooms = ?', q.bedrooms);
  if (q.minPrice !== undefined) add('p.price >= ?', q.minPrice);
  if (q.maxPrice !== undefined) add('p.price <= ?', q.maxPrice);

  const sort = SORTS[q.sort];
  const op = sort.dir === 'DESC' ? '<' : '>';

  // keyset pagination: continue after the last row of the previous page
  if (q.cursor) {
    let decoded: { v: string; id: string };
    try {
      decoded = JSON.parse(Buffer.from(q.cursor, 'base64url').toString());
    } catch {
      throw new AppError(400, 'Invalid cursor');
    }
    if (typeof decoded.v !== 'string' || !UUID_REGEX.test(decoded.id)) {
      throw new AppError(400, 'Invalid cursor');
    }
    values.push(decoded.v, decoded.id);
    where.push(
      `(${sort.column}, p.id) ${op} ($${values.length - 1}::${sort.cast}, $${values.length}::uuid)`
    );
  }

  values.push(q.limit + 1); // one extra row tells us if a next page exists

  const sql = `
    SELECT p.id, p.title, p.city, p.locality, p.price,
           p.property_type AS "propertyType", p.bedrooms, p.bathrooms,
           p.area_sqft AS "areaSqft", p.images[1] AS image,
           p.created_at AS "createdAt",
           ${sort.column}::text AS "sortValue"
    FROM properties p
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY ${sort.column} ${sort.dir}, p.id ${sort.dir}
    LIMIT $${values.length}`;

  let result;
  try {
    result = await pool.query(sql, values);
  } catch (err: any) {
    // a tampered cursor value can fail the type cast
    if (q.cursor && ['22P02', '22007', '22008'].includes(err.code)) {
      throw new AppError(400, 'Invalid cursor');
    }
    throw err;
  }

  const hasMore = result.rows.length > q.limit;
  const rows = result.rows.slice(0, q.limit);

  let nextCursor: string | null = null;
  if (hasMore) {
    const last = rows[rows.length - 1];
    nextCursor = Buffer.from(JSON.stringify({ v: last.sortValue, id: last.id })).toString('base64url');
  }

  return {
    data: rows.map(({ sortValue, ...rest }) => rest), // hide the helper field
    nextCursor,
    limit: q.limit,
  };
};

export const getSimilarProperties = async (id: string) => {
  if (!UUID_REGEX.test(id)) throw new AppError(400, 'Invalid property id');

  const base = await pool.query(
    'SELECT city, property_type, price, bedrooms FROM properties WHERE id = $1',
    [id]
  );
  if (base.rows.length === 0) throw new AppError(404, 'Property not found');
  const p = base.rows[0];

  const result = await pool.query(
    `SELECT id, title, city, locality, price, property_type AS "propertyType",
            bedrooms, area_sqft AS "areaSqft", images[1] AS image
     FROM properties
     WHERE LOWER(city) = LOWER($1)
       AND property_type = $2
       AND price BETWEEN $3::numeric * 0.8 AND $3::numeric * 1.2
       AND bedrooms BETWEEN $4::int - 1 AND $4::int + 1
       AND id <> $5
     ORDER BY ABS(price - $3::numeric), id
     LIMIT 6`,
    [p.city, p.property_type, p.price, p.bedrooms, id]
  );
  return result.rows;
};