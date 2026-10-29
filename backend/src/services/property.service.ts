import { pool } from '../config/db';
import { AppError } from '../utils/AppError';

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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