# Rediscover City API

This project is the backend REST API for the Rediscover City web application. It is built with [ElysiaJS](https://elysiajs.com/) and the [Bun](https://bun.sh/) runtime.

## Features

- **Reverse Geocoding**: Convert latitude and longitude coordinates into human-readable addresses (locality, city).
- **Location Narratives**: Generate descriptive and engaging information about a specific location using AI.
- **Nearby Places**: Discover interesting points of interest around a given location.

## API Endpoints

The following endpoints are available under the `/v1` prefix:

### Authentication
- `POST /v1/auth/login`: Login with email and password to get JWT token
- `POST /v1/auth/register`: Register a new user account with invite code
- `GET /v1/auth/google`: Redirect to Google OAuth for authentication
- `POST /v1/auth/google`: Process Google OAuth callback and return JWT token

### Location Services
- `GET /v1/locate`: Reverse geocode from `lat` and `lng` query parameters to locality and city information.
  - **Query Params**: `lat` (number), `lng` (number)
- `GET /v1/location/info`: Get AI-generated narrative information about a location.
  - **Query Params**: `place_id` (string, from Google Maps) or `lat` (number) and `lng` (number).
- `GET /v1/location/nearby`: Find nearby interesting places around a location.
  - **Query Params**: `lat` (number), `lng` (number)

## Development

To get started with development, follow these steps:

1.  **Install Dependencies**:
    ```bash
    bun install
    ```

2.  **Run Development Server**:
    To start the development server with live reloading, run:
    ```bash
    bun run dev
    ```
    The API will be available at `http://localhost:3000`.

3.  **Running Tests**:
   This project supports testing with pglite for faster, isolated tests. The test environment automatically uses pglite (in-memory PostgreSQL) instead of PostgreSQL.
   
   To run the test suite once:
    ```bash
    bun test
    ```
    To run tests in watch mode:
    ```bash
    bun run test:watch
    ```
    To run specific test files:
    ```bash
    bun test src/db/database.test.ts  # Database-specific tests
    ```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="your-postgres-connection-string"
DB_DIALECT="postgres"

# API Keys
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"
PERPLEXITY_API_KEY="your-perplexity-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_OAUTH_CLIENT_SECRET="your-google-oauth-client-secret"

# Authentication
JWT_SECRET="your-jwt-secret"

# Other
API_BASE_URL="http://localhost:3000"
GEOHASH_PRECISION=7
```

### Google OAuth Setup

To enable Google Login functionality:

1. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google OAuth API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for and enable "Google+ API" or "Google Identity API"

3. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `https://app.rediscover.city/auth/google/callback` (production)
     - `http://localhost:3001/auth/google/callback` (development)

4. **Configure Environment Variables**:
   - Copy the Client ID and Client Secret to your `.env` file
   - Set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`

## Database Configuration

The application uses PostgreSQL for production and pglite (in-memory PostgreSQL) for testing:

- **Production**: Uses PostgreSQL with connection string from `DATABASE_URL`
- **Testing**: Uses pglite (in-memory PostgreSQL) for isolated, fast tests

Environment configuration:
- `.env` - Default environment (PostgreSQL)
- `.env.local` - Local development overrides
- `.env.test` - Test environment - automatically loaded during tests
- `.env.production` - Production overrides

Schema files:
- `src/db/schema.postgres.ts` - PostgreSQL schema with native types
- `src/db/schema.ts` - Main schema file (PostgreSQL only)

## Dependencies

This project relies on a set of modern and efficient libraries to deliver its functionality:

| Library                                | Purpose                                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **[ElysiaJS](https://elysiajs.com/)**      | A fast, ergonomic, and type-safe web framework for Bun.                                             |
| **[Drizzle ORM](https://orm.drizzle.team/)** | A TypeScript ORM for building and querying SQL databases. Used here with PostgreSQL (production) and pglite (testing). |
| **[AI SDK](https://sdk.vercel.ai/)**       | A library for integrating AI models (like Google's Gemini and Perplexity) to generate content.      |
| **[Google Maps Services]**             | Node.js client for Google Maps services, used for geocoding and places data.                        |
| **[TypeBox](https://github.com/sinclairzx81/typebox)** | A library for creating JSON schemas and validating data, ensuring type safety for API requests. |
| **[Adze](https://github.com/AJ-Can-Code/adze)**            | A modern, configurable logger for Node.js.                                                        |
| **[ngeohash](https://github.com/sunng87/node-ngeohash)** | A library for geohashing, used for efficient geographic queries.                                    |

## Codebase Structure

The Rediscover City API follows a modular architecture with a clear separation of concerns:

```
src/
├── controllers/          # Business logic and database operations
├── db/                   # Database configuration and schema definitions
├── prompts/              # AI prompt templates for content generation
├── routes/               # API route definitions with validation
├── services/             # External service integrations and core logic
└── index.ts              # Application entry point
```

### Architecture Overview

The application follows a layered architecture pattern:

1. **Routes** - Define API endpoints with request/response validation using TypeBox schemas
2. **Controllers** - Handle business logic, coordinate between services and database operations
3. **Services** - Interact with external APIs (Google Maps, AI models) and implement core functionality
4. **Database** - PostgreSQL database with Drizzle ORM for data persistence

### Core Components

#### Controllers
- `GeocodingController` - Handles reverse geocoding operations and geohash management
- `LocationController` - Manages location information retrieval and caching

#### Services
- `geocoding.ts` - Integrates with Google Maps API for reverse geocoding
- `locationinfo.ts` - Coordinates with AI models to generate location narratives

#### Routes
- `v1/locate.ts` - Reverse geocoding endpoint (`/v1/locate`)
- `v1/location.ts` - Location information endpoints (`/v1/location/info`, `/v1/location/nearby`)

#### Database Models
- `geohashTable` - Stores geocoded location data with geohash as primary key
- `locationInfoTable` - Caches AI-generated location information

### Data Flow

1. **Reverse Geocoding** (`/v1/locate`):
   - Client sends lat/lng coordinates
   - GeocodingController checks cache (geohashTable)
   - If not found, GeocodingService calls Google Maps API
   - Result is cached in database

2. **Location Information** (`/v1/location/info`):
   - Client sends geohash or lat/lng coordinates
   - LocationController checks cache (locationInfoTable)
   - If not found, LocationService calls AI model with prompt
   - Result is cached in database

### Caching Strategy

The application implements a two-tier caching system:

1. **Geohash Cache**: Stores reverse geocoded location data to avoid repeated Google Maps API calls
2. **Location Info Cache**: Stores AI-generated narratives to avoid repeated AI API calls

Both caches use PostgreSQL tables with geohash as the primary key for efficient lookups.
