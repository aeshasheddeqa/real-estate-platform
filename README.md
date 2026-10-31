# Real Estate Listing Platform

A full-stack property listing platform in the style of 99acres or NoBroker. Users can register, post properties with images, search and filter listings, see similar properties and send inquiries to owners.

Built for the India Dits IT Solutions technical task. The company name, phone number, email, address and social links shown on the website are dummy placeholder data (see `frontend/lib/company.ts`).

## Table of contents

1. [Tech stack](#tech-stack)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Project structure](#project-structure)
5. [Getting started](#getting-started)
6. [Environment variables](#environment-variables)
7. [Scripts](#scripts)
8. [API overview](#api-overview)
9. [Design decisions](#design-decisions)
10. [Security summary](#security-summary)
11. [Troubleshooting](#troubleshooting)
12. [Known limitations and next steps](#known-limitations-and-next-steps)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (plain SQL with the `pg` driver, no ORM) |
| Validation | Zod |
| Authentication | JWT access token, refresh token in an httpOnly cookie, bcrypt |
| File uploads | Multer |
| API documentation | Swagger UI at `/api-docs` |

## Features

**Visitors**
- Home page with a quick search, property categories and the latest listings
- Search properties by city, type, bedrooms and price range, with sorting and "Load more" pagination
- Property detail page with image gallery, description and similar properties
- About Us, Services and Contact Us pages, a responsive navbar and a footer with company details

**Registered users**
- Register and log in (mandatory fields are marked with a red `*`, passwords can be shown or hidden)
- Forgot password and reset password
- Dashboard: my properties (paginated), add, edit and delete a property with up to 5 images
- Send an inquiry to a property owner, and see the inquiries received on your own properties (paginated)

**Platform**
- Cursor (keyset) pagination, composite database indexes and a seed script for 50,000 properties
- Spam protection for inquiries, rate limiting on login and password reset
- SEO: server rendering, per-property metadata, Open Graph tags and JSON-LD structured data

## Screenshots

<!-- Add your screenshots to docs/screenshots and update the file names below -->

| Home | Listing with filters |
|---|---|
| ![Home](docs/screenshots/home.png) | ![Listing](docs/screenshots/listing.png) |

| Property detail | Dashboard |
|---|---|
| ![Detail](docs/screenshots/detail.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Swagger docs | EXPLAIN ANALYZE before and after indexes |
|---|---|
| ![Swagger](docs/screenshots/swagger.png) | ![Explain](docs/screenshots/explain.png) |

## Project structure

```
backend/
  src/
    config/        environment and database connection
    controllers/   HTTP layer (request and response)
    services/      business logic and SQL
    middleware/    auth, validation, rate limiting, uploads, error handler
    routes/        URL definitions
    schemas/       Zod validation schemas
    utils/         AppError, UUID check, cursor helpers
    db/            schema.sql and seed.ts
    docs/          Swagger specification
    app.ts         Express app setup
    server.ts      starts the server
frontend/
  app/             pages: home, properties, property detail, login, register,
                   forgot-password, reset-password, about, services, contact, dashboard
  components/      Navbar, Footer, Logo, PropertyCard, FilterBar, PropertyGrid,
                   InquiryForm, PropertyForm, ContactForm, PasswordInput
  lib/             API helpers, types, auth context, company details
```

Request flow in the backend: route, then middleware, then controller, then service, then database. Every error ends up in one central error handler.

## Getting started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 13 or higher (the schema uses `gen_random_uuid()`)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/aeshasheddeqa/real-estate-platform.git
cd real-estate-platform
```

### 2. Create the database

Create an empty database called `realestate` and run the schema file. The schema creates all tables and indexes, so it must be run before the backend starts.

With the command line:

```bash
createdb realestate
psql -d realestate -f backend/src/db/schema.sql
```

With pgAdmin (common on Windows): create a database named `realestate`, open a Query Tool on it, open `backend/src/db/schema.sql` with the folder icon, and press Run. You should end up with five tables: `users`, `refresh_tokens`, `properties`, `inquiries` and `password_resets`.

### 3. Start the backend

```bash
cd backend
npm install
```

Create the environment file from the template:

```bash
# macOS / Linux
cp .env.example .env

# Windows (PowerShell or Command Prompt)
copy .env.example .env
```

**Important: edit `.env` before starting.** The backend does not work with the placeholder values. Set your real PostgreSQL password in `DATABASE_URL`, and replace both JWT secrets with long random strings (they must be different from each other). You can generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then start the server:

```bash
npm run dev
```

You should see `Server running on port 5000`. Check it at:

- Health check: http://localhost:5000/health
- Swagger documentation: http://localhost:5000/api-docs

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

```bash
# macOS / Linux
cp .env.example .env.local

# Windows
copy .env.example .env.local
```

```bash
npm run dev
```

Open http://localhost:3000. The backend must be running, otherwise the listing pages show a message that the API cannot be reached.

### 5. Seed 50,000 properties (optional)

Register one user first, through the website or the API. Then:

```bash
cd backend
npm run seed
```

The script inserts 50,000 random properties in batches of 1,000. All of them are assigned to the first registered user, so use a second account for the owner and inquiry flows.

### Trying the password reset

There is no email service in this project. When you request a password reset, the reset link is **printed in the backend terminal**. Copy it into the browser to set a new password. The link works once and expires after 30 minutes.

## Environment variables

### backend/.env

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port of the API | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://postgres:your_password@localhost:5432/realestate` |
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens | a long random string |
| `JWT_REFRESH_SECRET` | Secret used to sign refresh tokens (different from the access secret) | another long random string |
| `CLIENT_URL` | Exact origin of the frontend, used by CORS and in reset links (no trailing slash) | `http://localhost:3000` |
| `NODE_ENV` | `development` or `production` | `development` |

### frontend/.env.local

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:5000` |

Restart the dev servers after changing any environment file.

## Scripts

| Where | Command | What it does |
|---|---|---|
| backend | `npm run dev` | Starts the API with automatic restart |
| backend | `npm run build` | Compiles TypeScript to `dist/` |
| backend | `npm start` | Runs the compiled build |
| backend | `npm run seed` | Inserts 50,000 sample properties |
| frontend | `npm run dev` | Starts the website in development |
| frontend | `npm run build` | Production build |
| frontend | `npm start` | Runs the production build |

## API overview

Full request and response details, with examples, are in Swagger at `/api-docs`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in |
| POST | `/api/auth/refresh` | Cookie | Get a new access token |
| POST | `/api/auth/logout` | No | Clear the refresh cookie |
| GET | `/api/auth/me` | Yes | The current user |
| POST | `/api/auth/forgot-password` | No | Request a password reset link |
| POST | `/api/auth/reset-password` | No | Set a new password with a reset token |
| GET | `/api/properties` | No | Search, filter, sort and paginate |
| POST | `/api/properties` | Yes | Create a property (multipart form with images) |
| GET | `/api/properties/mine` | Yes | My properties (paginated) |
| GET | `/api/properties/:id` | No | Property details |
| PUT | `/api/properties/:id` | Owner | Update a property |
| DELETE | `/api/properties/:id` | Owner | Delete a property |
| GET | `/api/properties/:id/similar` | No | Similar properties |
| POST | `/api/properties/:id/inquiries` | Yes | Send an inquiry to the owner |
| GET | `/api/inquiries/received` | Yes | Inquiries on my properties (paginated) |
| GET | `/api/inquiries/sent` | Yes | Inquiries I have sent |

Search query parameters for `GET /api/properties`: `city`, `propertyType` (apartment, villa, house, plot, commercial), `bedrooms`, `minPrice`, `maxPrice`, `sort` (newest, price_asc, price_desc), `limit` (1 to 50, default 20) and `cursor`. List endpoints return `{ data, nextCursor }`.

## Design decisions

### Authentication and token strategy

- Passwords are hashed with bcrypt.
- Login returns a short-lived access token (15 minutes) in the response body. The frontend keeps it in memory only, never in localStorage, and sends it as a Bearer token.
- A refresh token (7 days) is stored in an httpOnly cookie, which JavaScript cannot read. The frontend uses it to restore the session on page load and to get a new access token after a 401. If a request returns 401, the frontend refreshes once and retries.
- Login returns the same error for an unknown email and a wrong password, so attackers cannot find out which emails are registered.
- Trade-off: refresh tokens are stateless, so they cannot be revoked before they expire. In production I would store token hashes in the database or Redis and rotate them on every refresh.

### Password reset

The user enters an email and the server creates 32 random bytes as a token. Only the SHA-256 hash of the token is stored, with a 30 minute expiry, and only one active link exists per user. The reset endpoint checks the hash and the expiry, updates the password, and deletes the token so it works only once. The API answers the same way whether or not the email exists, so accounts cannot be discovered. Both endpoints are rate limited. Because there is no email service, the link is written to the server log; in production it would be sent with an email provider such as SES, SendGrid or SMTP.

### Validation and error handling

- Every request body and query string is validated with Zod in reusable middleware before it reaches the business logic. The same rules are repeated in the browser with required fields, but the server never trusts the browser.
- Services throw `AppError` with a status code, and one central error handler turns it into a response. Unknown errors return a generic 500 and are logged, so internals never leak. In development the response also includes a `detail` field to make debugging easier.
- Status codes: 400 invalid input, 401 not logged in, 403 not the owner, 404 not found, 409 conflict (duplicate), 429 too many requests.

### Search, pagination and indexes

The listing endpoint builds its WHERE clause only from the filters that were sent. All user values go through parameterized queries, and the ORDER BY column and direction come from a fixed whitelist, never from user input.

Indexes (all in `schema.sql`):

| Index | Purpose |
|---|---|
| `properties (LOWER(city), property_type, bedrooms, price)` | Search. Equality filters come first and the range column (price) last. `LOWER(city)` lets case-insensitive search use the index. |
| `properties (created_at DESC, id DESC)` | Default sort and the pagination cursor |
| `properties (price, id)` | Sorting by price |
| `properties (owner_id, created_at DESC, id DESC)` | Dashboard: my properties |
| `inquiries (property_id, created_at DESC)` and `(sender_id, created_at DESC)` | Inquiry lookups |
| `inquiries (created_at DESC, id DESC)` | Inquiries received, paginated |
| `password_resets (user_id)` | Reset token lookup |

Measured with `EXPLAIN ANALYZE` on 50,005 properties, for a search by city, type and bedrooms, newest first:

| | Before indexes | After indexes |
|---|---|---|
| Plan | Sequential scan | Bitmap index scan on the search index |
| Rows read | 50,005 (49,728 discarded) | 277 |
| Buffers touched | 1,668 | 264 |
| Execution time | 6.3 ms | 0.7 ms |

**Cursor (keyset) pagination.** The API returns a `nextCursor`, which is the last row's sort value and id, encoded in base64. The next request continues after that position with `WHERE (sort_column, id) < (cursor)`. The server fetches `limit + 1` rows to know whether another page exists, without a separate COUNT query. The id is part of the cursor because many rows share the same date or price, and the id keeps the order stable. Measured on the same data:

| | OFFSET 40000 | Keyset |
|---|---|---|
| Index entries read | 40,020 | 20 |
| Buffers touched | 200 | 3 |
| Execution time | 4.4 ms | 0.055 ms |

The cost of keyset pagination stays constant on any page, while OFFSET grows with depth. The trade-off is that users move forward through pages and cannot jump to an arbitrary page number, which suits "Load more" lists. The same technique is used for My properties and for Inquiries received, because every list endpoint needs a limit (an unlimited list of 50,000 rows once crashed the dashboard during testing).

The list responses are kept small: only the fields a card needs, and the first image.

### Similar properties

A simple, explainable rule: same city and type, price within plus or minus 20 percent, bedrooms within one, closest price first, at most 6 results, excluding the property itself. It uses the same composite index. If nothing is close enough, the section is hidden. Future work: widen the price band as a fallback and rank by distance.

### Inquiries and spam protection

1. Validation: the message must be 10 to 1000 characters and HTML tags are stripped.
2. Duplicates: a unique constraint on `(property_id, sender_id)` allows one inquiry per user per property. It is enforced by the database, and the unique violation is turned into a 409, so it is safe even when two requests arrive at the same moment.
3. Rate limiting: 5 inquiries per hour per logged-in user (keyed by user id, not IP address). Login, register and password reset are limited by IP address.
4. Users cannot send an inquiry on their own property.

The rate limiter keeps its counters in memory, which is fine for a single server. With several servers I would use a Redis store.

### Image uploads

Multer saves files to `backend/uploads` (the folder is created automatically on startup). It accepts JPG, PNG and WEBP only, up to 5 MB each and 5 files per request. File names are random UUIDs, which avoids collisions and unsafe names. Only the paths are stored in the database (`TEXT[]`). In production I would use object storage such as S3 or Cloudinary.

### SEO and rendering

- The home, listing and detail pages are server components, so the first render happens on the server.
- Filters are a plain GET form, so a search lives in the URL, can be shared, and works without JavaScript.
- Property pages use incremental static regeneration (revalidated every 60 seconds), because listings change rarely.
- `generateMetadata` gives every property its own title, description and Open Graph tags, and the page includes JSON-LD structured data (`RealEstateListing`).
- Unknown property ids show a proper not-found page.

### Frontend structure

- Server components fetch data for public pages. Small client components handle interaction: the navbar, "Load more", the forms, and the auth context.
- Route protection on the dashboard is a convenience only. The real security is on the API, where every update and delete checks ownership.
- The navbar is responsive (a menu button on small screens) and the company details come from one file, `frontend/lib/company.ts`.

## Security summary

bcrypt password hashing, short-lived JWT access tokens, an httpOnly refresh cookie, parameterized SQL, Zod validation on every input, helmet security headers, CORS limited to the frontend origin, rate limiting, a request body size limit, upload type and size limits, ownership checks on every change, single-use hashed reset tokens, and a central error handler that hides internals.

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| Login or register returns "Internal server error" | Usually `.env` still has the placeholder values, or the database tables do not exist. Edit `backend/.env`, make sure `DATABASE_URL` points to a database where `schema.sql` was run, and restart the backend. The real error is printed in the backend terminal. |
| `Missing env variable` when the backend starts | `backend/.env` is missing or incomplete. Copy `.env.example` and fill it in. |
| `password authentication failed` | The password in `DATABASE_URL` is wrong. |
| `relation "users" does not exist` | `schema.sql` has not been run on this database. |
| Website shows "Cannot reach the API" or `ECONNREFUSED` on port 5000 | The backend is not running. Start it with `npm run dev` in `backend`. |
| `EADDRINUSE` (port already in use) | Another copy of the server is running. Stop it or change `PORT`. |
| Logged out after every refresh | `CLIENT_URL` in `backend/.env` must be exactly `http://localhost:3000` (no trailing slash) so the cookie works. Restart the backend. |
| Website has no styling | The frontend needs `postcss.config.mjs` and `@import "tailwindcss";` at the top of `app/globals.css`. Delete the `.next` folder and restart. |
| Login with an account from another database gives "Invalid email or password" | The database is new and empty. Register a new account. |

## Known limitations and next steps

- Refresh tokens cannot be revoked (see above). Storing hashed tokens and rotating them would fix this.
- The password reset email is only logged to the console, and the contact form opens the visitor's email app. In production both would use an email provider.
- Images are stored on the local disk and are not deleted when a property is deleted. Cloud storage and cleanup would fix this.
- Multer saves files before the other fields are validated, so a rejected request can leave orphan files.
- Choosing new images when editing replaces all existing images.
- The detail page shows an error if the API is down; the listing page handles it with a message.
- No automated tests yet (Jest and Supertest for the API would be the next step).
- No email verification.
- Edits can take up to 60 seconds to appear on the public detail page (static regeneration). On-demand revalidation after each edit would make it instant.
