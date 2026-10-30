import { pool } from '../config/db';
import { AppError } from '../utils/AppError';
import { UUID_REGEX } from '../utils/uuid';

export const createInquiry = async (propertyId: string, senderId: string, message: string) => {
  if (!UUID_REGEX.test(propertyId)) throw new AppError(400, 'Invalid property id');

  const property = await pool.query('SELECT owner_id FROM properties WHERE id = $1', [propertyId]);
  if (property.rows.length === 0) throw new AppError(404, 'Property not found');
  if (property.rows[0].owner_id === senderId) {
    throw new AppError(400, 'You cannot send an inquiry on your own property');
  }

  try {
    const result = await pool.query(
      `INSERT INTO inquiries (property_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, property_id AS "propertyId", message, created_at AS "createdAt"`,
      [propertyId, senderId, message]
    );
    return result.rows[0];
  } catch (err: any) {
    // 23505 = unique violation: this user already sent an inquiry for this property
    if (err.code === '23505') {
      throw new AppError(409, 'You have already sent an inquiry for this property');
    }
    throw err;
  }
};

// inquiries received on the logged-in user's properties
export const getReceivedInquiries = async (ownerId: string) => {
  const result = await pool.query(
    `SELECT i.id, i.message, i.created_at AS "createdAt",
            p.id AS "propertyId", p.title AS "propertyTitle",
            u.name AS "senderName", u.email AS "senderEmail", u.phone AS "senderPhone"
     FROM inquiries i
     JOIN properties p ON p.id = i.property_id
     JOIN users u ON u.id = i.sender_id
     WHERE p.owner_id = $1
     ORDER BY i.created_at DESC
     LIMIT 100`,
    [ownerId]
  );
  return result.rows;
};

// inquiries the logged-in user has sent
export const getSentInquiries = async (senderId: string) => {
  const result = await pool.query(
    `SELECT i.id, i.message, i.created_at AS "createdAt",
            p.id AS "propertyId", p.title AS "propertyTitle", p.city
     FROM inquiries i
     JOIN properties p ON p.id = i.property_id
     WHERE i.sender_id = $1
     ORDER BY i.created_at DESC
     LIMIT 100`,
    [senderId]
  );
  return result.rows;
};