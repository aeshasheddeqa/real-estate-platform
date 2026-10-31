const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: object) => ({ required: true, content: { 'application/json': { schema } } });
const ok = (description: string, schema?: object) => ({
  description,
  ...(schema ? { content: { 'application/json': { schema } } } : {}),
});
const err = (description: string) => ok(description, ref('Error'));
const secured = [{ bearerAuth: [] }];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } };

const propertyFields = {
  title: { type: 'string', example: '2 BHK Apartment in Anna Nagar' },
  description: { type: 'string', example: 'Spacious apartment with parking, near metro and schools.' },
  city: { type: 'string', example: 'Chennai' },
  locality: { type: 'string', example: 'Anna Nagar' },
  price: { type: 'number', example: 6500000 },
  propertyType: { type: 'string', enum: ['apartment', 'villa', 'house', 'plot', 'commercial'] },
  bedrooms: { type: 'integer', example: 2 },
  bathrooms: { type: 'integer', example: 2 },
  areaSqft: { type: 'integer', example: 1100 },
};

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Real Estate Listing API',
    version: '1.0.0',
    description:
      'Property listing platform: auth, property CRUD with images, search with keyset pagination, similar properties and inquiries.',
  },
  servers: [{ url: 'http://localhost:5000' }],
  tags: [{ name: 'Auth' }, { name: 'Properties' }, { name: 'Inquiries' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: { type: 'object', properties: { message: { type: 'string' } } },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' } } },
          accessToken: { type: 'string' },
        },
      },
      PropertySummary: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' }, ...propertyFields, image: { type: 'string', nullable: true }, createdAt: { type: 'string', format: 'date-time' } },
      },
      Property: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' }, owner_id: { type: 'string' }, ...propertyFields, images: { type: 'array', items: { type: 'string' } }, ownerName: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } },
      },
      SearchResponse: {
        type: 'object',
        properties: { data: { type: 'array', items: ref('PropertySummary') }, nextCursor: { type: 'string', nullable: true }, limit: { type: 'integer' } },
      },
      Inquiry: {
        type: 'object',
        properties: { id: { type: 'string' }, propertyId: { type: 'string' }, message: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' } },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Register a new user',
        requestBody: json({ type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string', example: '9876543210' }, password: { type: 'string', minLength: 8 } } }),
        responses: { 201: ok('User created; refresh token set as httpOnly cookie', ref('AuthResponse')), 400: err('Validation failed'), 409: err('Email already registered'), 429: err('Too many attempts') },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Log in',
        requestBody: json({ type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } }),
        responses: { 200: ok('Logged in', ref('AuthResponse')), 400: err('Validation failed'), 401: err('Invalid email or password'), 429: err('Too many attempts') },
      },
    },
    '/api/auth/refresh': {
      post: { tags: ['Auth'], summary: 'Get a new access token using the refresh token cookie', responses: { 200: ok('New access token'), 401: err('Missing or invalid refresh token') } },
    },
    '/api/auth/logout': {
      post: { tags: ['Auth'], summary: 'Log out (clears the refresh token cookie)', responses: { 204: ok('Logged out') } },
    },
    '/api/properties': {
      get: {
        tags: ['Properties'], summary: 'Search properties (filters, sorting, cursor pagination)',
        parameters: [
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'propertyType', in: 'query', schema: { type: 'string', enum: ['apartment', 'villa', 'house', 'plot', 'commercial'] } },
          { name: 'bedrooms', in: 'query', schema: { type: 'integer' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc'], default: 'newest' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } },
          { name: 'cursor', in: 'query', description: 'nextCursor from the previous page', schema: { type: 'string' } },
        ],
        responses: { 200: ok('A page of properties', ref('SearchResponse')), 400: err('Invalid query or cursor') },
      },
      post: {
        tags: ['Properties'], summary: 'Create a property (up to 5 images)', security: secured,
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['title', 'description', 'city', 'price', 'propertyType', 'areaSqft'], properties: { ...propertyFields, images: { type: 'array', items: { type: 'string', format: 'binary' } } } } } } },
        responses: { 201: ok('Created', ref('Property')), 400: err('Validation failed or invalid file'), 401: err('Not logged in') },
      },
    },
    '/api/properties/mine': {
      get: { tags: ['Properties'], summary: 'My properties', security: secured, responses: { 200: ok('List of my properties'), 401: err('Not logged in') } },
    },
    '/api/properties/{id}': {
      get: { tags: ['Properties'], summary: 'Get one property', parameters: [idParam], responses: { 200: ok('The property', ref('Property')), 400: err('Invalid id'), 404: err('Not found') } },
      put: {
        tags: ['Properties'], summary: 'Update a property (owner only)', security: secured, parameters: [idParam],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { ...propertyFields, images: { type: 'array', items: { type: 'string', format: 'binary' } } } } } } },
        responses: { 200: ok('Updated', ref('Property')), 400: err('Validation failed'), 401: err('Not logged in'), 403: err('Not the owner'), 404: err('Not found') },
      },
      delete: { tags: ['Properties'], summary: 'Delete a property (owner only)', security: secured, parameters: [idParam], responses: { 204: ok('Deleted'), 401: err('Not logged in'), 403: err('Not the owner'), 404: err('Not found') } },
    },
    '/api/properties/{id}/similar': {
      get: { tags: ['Properties'], summary: 'Similar properties (same city and type, price within 20 percent)', parameters: [idParam], responses: { 200: ok('Up to 6 similar properties'), 400: err('Invalid id'), 404: err('Not found') } },
    },
    '/api/properties/{id}/inquiries': {
      post: {
        tags: ['Inquiries'], summary: 'Send an inquiry to the property owner (5 per hour, one per property)', security: secured, parameters: [idParam],
        requestBody: json({ type: 'object', required: ['message'], properties: { message: { type: 'string', minLength: 10, maxLength: 1000 } } }),
        responses: { 201: ok('Inquiry sent', ref('Inquiry')), 400: err('Invalid message or own property'), 401: err('Not logged in'), 404: err('Property not found'), 409: err('Already inquired'), 429: err('Rate limit exceeded') },
      },
    },
    '/api/inquiries/received': {
  get: {
    tags: ['Inquiries'], summary: 'Inquiries received on my properties (cursor pagination)', security: secured,
    parameters: [
      { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } },
      { name: 'cursor', in: 'query', description: 'nextCursor from the previous page', schema: { type: 'string' } },
    ],
    responses: { 200: ok('A page of inquiries: { data, nextCursor }'), 400: err('Invalid cursor'), 401: err('Not logged in') },
  },
},
    '/api/inquiries/sent': {
      get: { tags: ['Inquiries'], summary: 'Inquiries I have sent', security: secured, responses: { 200: ok('List of inquiries'), 401: err('Not logged in') } },
    },
    '/api/auth/forgot-password': {
  post: {
    tags: ['Auth'], summary: 'Request a password reset link (always answers 200)',
    requestBody: json({ type: 'object', required: ['email'], properties: { email: { type: 'string' } } }),
    responses: { 200: ok('Generic confirmation message'), 400: err('Validation failed'), 429: err('Too many attempts') },
  },
},
'/api/auth/reset-password': {
  post: {
    tags: ['Auth'], summary: 'Set a new password using the reset token',
    requestBody: json({ type: 'object', required: ['token', 'password'], properties: { token: { type: 'string' }, password: { type: 'string', minLength: 8 } } }),
    responses: { 200: ok('Password updated'), 400: err('Invalid or expired link, or validation failed'), 429: err('Too many attempts') },
  },
},
  },
};