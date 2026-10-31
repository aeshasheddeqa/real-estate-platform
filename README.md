# Real Estate Listing Platform

A full-stack property listing platform (similar to 99acres / NoBroker). Users can register, post properties with images, search and filter listings, see similar properties and send inquiries to owners.

Built for the India Dits IT Solutions technical task.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (plain SQL with the `pg` driver) |
| Validation | Zod |
| Auth | JWT access token + refresh token in an httpOnly cookie, bcrypt |
| Docs | Swagger UI at `/api-docs` |

## Features

- Register, log in, refresh session, log out
- Create, edit and delete properties with up to 5 images (owner only)
- Search by city, type, bedrooms and price range, with sorting and cursor pagination
- Property detail page with image gallery and similar properties
- Inquiry to the property owner, with spam protection
- Dashboard: my properties (paginated), add, edit, delete, and inquiries received
- SEO: server rendering, per-property metadata, Open Graph tags, JSON-LD

## Project structure

```
backend/src/
  config/        env and database connection
  controllers/   HTTP layer (request and response)
  services/      business logic and SQL
  middleware/    auth, validation, rate limiting, uploads, error handler
  routes/        URL definitions
  schemas/       Zod validation schemas
  db/            schema.sql and seed.ts
  docs/          Swagger specification
frontend/
  app/           pages (listing, detail, login, register, dashboard)
  components/    reusable UI (PropertyCard, FilterBar, PropertyGrid, forms)
  lib/           API helpers, types, auth context
```

Request flow: route, then middleware, then controller, then service, then database. Errors always go to one central error handler.

## Getting started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 13 or higher (the schema uses `gen_random_uuid()`)

### 1. Database

Create a database named `realestate`, then run the schema:

```bash
createdb realestate
psql -d realestate -f backend/src/db/schema.sql
```

On Windows you can instead open pgAdmin, open a Query Tool on the `realestate` database, paste the contents of `backend/src/db/schema.sql` and run it.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit the values
npm run dev
```

`.env` values:

```
PORT=5000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/realestate
JWT_ACCESS_SECRET=a_long_random_string
JWT_REFRESH_SECRET=a_different_long_random_string
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Generate secrets with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

The API runs at http://localhost:5000 and Swagger docs at http://localhost:5000/api-docs.

### 3. Seed 50,000 properties (optional)

Register one user first (through the app or the API), then:

```bash
cd backend
npm run seed
```

The seed script assigns all generated properties to the first registered user.

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Open http://localhost:3000.

## API overview

Full details and request examples are in Swagger at `/api-docs`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create an account |
| POST | /api/auth/login | No | Log in |
| POST | /api/auth/refresh | Cookie | New access token |
| POST | /api/auth/logout | No | Clear refresh cookie |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/properties | No | Search, filter, sort, paginate |
| POST | /api/properties | Yes | Create property (multipart, images) |
| GET | /api/properties/mine | Yes | My properties (paginated) |
| GET | /api/properties/:id | No | Property details |
| PUT | /api/properties/:id | Owner | Update property |
| DELETE | /api/properties/:id | Owner | Delete property |
| GET | /api/properties/:id/similar | No | Similar properties |
| POST | /api/properties/:id/inquiries | Yes | Send an inquiry |
| GET | /api/inquiries/received | Yes | Inquiries on my properties |
| GET | /api/inquiries/sent | Yes | Inquiries I sent |

## Design decisions

### Authentication and token strategy

- Passwords are hashed with bcrypt.
- Login returns a short-lived access token (15 minutes) in the response body. The frontend keeps it in memory only, so it is not exposed to storage-based theft, and sends it as a Bearer token.
- A refresh token (7 days) is stored in an httpOnly cookie, which JavaScript cannot read. The frontend uses it to restore the session on page load and to get a new access token after a 401.
- Login returns the same error for an unknown email and a wrong password, so attackers cannot find out which emails exist.
- Trade-off: refresh tokens are stateless, so they cannot be revoked before they expire. In production I would store token hashes in the database or Redis and rotate them on every refresh.

### Validation and error handling

- Every request body and query string is validated with Zod in reusable middleware before it reaches the business logic.
- Services throw `AppError` with a status code. One central error handler turns it into a response. Unknown errors return a generic 500 and are logged, so internals never leak. In development the response also includes a `detail` field to help debugging.
- Status codes: 400 invalid input, 401 not logged in, 403 not the owner, 404 not found, 409 conflict (duplicate), 429 too many requests.

### Search, pagination and indexes

The listing endpoint builds its WHERE clause only from the filters that were sent. All user values go through parameterized queries. The ORDER BY column and direction come from a fixed whitelist, never from user input.

Indexes (in `schema.sql`):

- `(LOWER(city), property_type, bedrooms, price)`: equality filters first, the range column (price) last. `LOWER(city)` makes case-insensitive search use the index.
- `(created_at DESC, id DESC)`: the default sort and the pagination cursor.
- `(price, id)`: sorting by price.
- `(owner_id, created_at DESC, id DESC)`: the dashboard.

Measured with `EXPLAIN ANALYZE` on 50,005 properties, for a search by city, type and bedrooms, newest first:

| | Before indexes | After indexes |
|---|---|---|
| Plan | Sequential scan | Bitmap index scan on the search index |
| Rows read | 50,005 (49,728 discarded) | 277 |
| Buffers touched | 1,668 | 264 |
| Execution time | 6.3 ms | 0.7 ms |

**Cursor (keyset) pagination.** The API returns a `nextCursor` (the last row's sort value and id, base64 encoded). The next request continues after that position using `WHERE (sort_column, id) < (cursor)`. It fetches `limit + 1` rows to know whether another page exists without a COUNT query. Compared on the same data:

| | OFFSET 40000 | Keyset |
|---|---|---|
| Index entries read | 40,020 | 20 |
| Buffers touched | 200 | 3 |
| Execution time | 4.4 ms | 0.055 ms |

Keyset cost stays constant on any page, while OFFSET grows with depth. Trade-off: users move forward through pages and cannot jump to an arbitrary page number.

The API response also keeps the payload small: the list returns only the fields a card needs and the first image.

### Similar properties

A simple, explainable rule: same city and type, price within plus or minus 20 percent, bedrooms within one, closest price first, maximum 6, excluding the property itself. It uses the same composite index. If nothing is close enough the section is hidden. Future work: widen the price band as a fallback, and rank by location distance.

### Inquiries and spam protection

1. Validation: message of 10 to 1000 characters, HTML tags stripped.
2. Duplicate protection: a unique constraint on (property_id, sender_id) allows one inquiry per user per property. It is enforced by the database, and the unique violation is turned into a 409, so it is safe even for simultaneous requests.
3. Rate limiting: 5 inquiries per hour per logged-in user (keyed by user id, not IP). Login and register are limited by IP.
4. Users cannot send an inquiry on their own property.

The rate limiter keeps its counts in memory, which is fine for one server. With several servers I would use a Redis store.

### Image uploads

Multer saves files to `backend/uploads` (created automatically on startup). It accepts JPG, PNG and WEBP only, up to 5 MB each and 5 files. File names are random UUIDs, which avoids collisions and unsafe names. Only the paths are stored in the database (`TEXT[]`). In production I would use object storage such as S3 or Cloudinary.

### SEO and rendering

- The listing and detail pages are server components, so the first render happens on the server.
- Filters are a plain GET form, so searches live in the URL and work without JavaScript.
- Property pages use incremental static regeneration (revalidate every 60 seconds) because listings change rarely.
- `generateMetadata` gives each property its own title, description and Open Graph tags, and the page includes JSON-LD structured data.
- Unknown ids show a proper not-found page.

## Security summary

bcrypt password hashing, JWT with short expiry, httpOnly refresh cookie, parameterized SQL, Zod validation, helmet headers, CORS limited to the frontend origin, rate limiting, request body size limit, upload type and size limits, ownership checks on every change, and a central error handler that hides internals.

## Known limitations and next steps

- Refresh tokens cannot be revoked (see above).
- Images are stored on local disk and are not deleted when a property is deleted. Cloud storage and cleanup would fix this.
- Multer saves files before the other fields are validated, so a rejected request can leave orphan files.
- Choosing new images on edit replaces all existing images.
- No automated tests yet (Jest and Supertest would be next).
- No email verification or password reset.

## Screenshots

<add screenshots: listing page, detail page, dashboard, Swagger, EXPLAIN ANALYZE before and after>