import { pool } from '../config/db';
import { AppError } from '../utils/AppError';
import { UUID_REGEX } from '../utils/uuid';
import { encodeCursor, decodeCursor } from '../utils/cursor';

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
// inquiries received on the logged-in user's properties (keyset pagination, newest first)
export const getReceivedInquiries = async (ownerId: string, limit: number, cursor?: string) => {
  const values: any[] = [ownerId];
  let cursorSql = '';

  if (cursor) {
    const decoded = decodeCursor(cursor);
    values.push(decoded.v, decoded.id);
    cursorSql = 'AND (i.created_at, i.id) < ($2::timestamptz, $3::uuid)';
  }

  values.push(limit + 1); // one extra row tells us if there is a next page

  let result;
  try {
    result = await pool.query(
      `SELECT i.id, i.message, i.created_at AS "createdAt",
              p.id AS "propertyId", p.title AS "propertyTitle",
              u.name AS "senderName", u.email AS "senderEmail", u.phone AS "senderPhone",
              i.created_at::text AS "sortValue"
       FROM inquiries i
       JOIN properties p ON p.id = i.property_id
       JOIN users u ON u.id = i.sender_id
       WHERE p.owner_id = $1 ${cursorSql}
       ORDER BY i.created_at DESC, i.id DESC
       LIMIT $${values.length}`,
      values
    );
  } catch (err: any) {
    // a tampered cursor value can fail the type cast
    if (cursor && ['22P02', '22007', '22008'].includes(err.code)) {
      throw new AppError(400, 'Invalid cursor');
    }
    throw err;
  }

  const hasMore = result.rows.length > limit;
  const rows = result.rows.slice(0, limit);
  const last = rows[rows.length - 1];

  return {
    data: rows.map(({ sortValue, ...rest }) => rest),
    nextCursor: hasMore ? encodeCursor(last.sortValue, last.id) : null,
  };
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