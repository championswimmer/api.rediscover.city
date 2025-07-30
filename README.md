# Rediscover City API

This project is the backend REST API for the Rediscover City web application. It is built with [ElysiaJS](https://elysiajs.com/) and the [Bun](https://bun.sh/) runtime.

## Features

- **Reverse Geocoding**: Convert latitude and longitude coordinates into human-readable addresses (locality, city).
- **Location Narratives**: Generate descriptive and engaging information about a specific location using AI.
- **Nearby Places**: Discover interesting points of interest around a given location.

## API Endpoints

The following endpoints are available under the `/v1` prefix:

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
    This project supports testing with SQLite for faster, isolated tests. The test environment automatically uses SQLite instead of PostgreSQL.
    
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

## Database Configuration

The application supports both PostgreSQL (production) and SQLite (testing) databases:

- **Production**: Uses PostgreSQL with connection string from `DATABASE_URL`
- **Testing**: Uses SQLite with file path from `DATABASE_URL` when `DB_DIALECT=sqlite`

Environment configuration:
- `.env` - Default environment (PostgreSQL)
- `.env.local` - Local development overrides
- `.env.test` - Test environment (SQLite) - automatically loaded during tests
- `.env.production` - Production overrides

The database dialect is controlled by the `DB_DIALECT` environment variable:
- `postgresql` (default) - Uses PostgreSQL
- `sqlite` - Uses SQLite (for tests)

Schema files:
- `src/db/schema.postgres.ts` - PostgreSQL schema with native types
- `src/db/schema.sqlite.ts` - SQLite schema with compatible types
- `src/db/schema.ts` - Dynamic schema loader based on dialect

## Dependencies

This project relies on a set of modern and efficient libraries to deliver its functionality:

| Library                                | Purpose                                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **[ElysiaJS](https://elysiajs.com/)**      | A fast, ergonomic, and type-safe web framework for Bun.                                             |
| **[Drizzle ORM](https://orm.drizzle.team/)** | A TypeScript ORM for building and querying SQL databases. Used here with PostgreSQL (production) and SQLite (testing). |
| **[AI SDK](https://sdk.vercel.ai/)**       | A library for integrating AI models (like Google's Gemini and Perplexity) to generate content.      |
| **[Google Maps Services]**             | Node.js client for Google Maps services, used for geocoding and places data.                        |
| **[TypeBox](https://github.com/sinclairzx81/typebox)** | A library for creating JSON schemas and validating data, ensuring type safety for API requests. |
| **[Adze](https://github.com/AJ-Can-Code/adze)**            | A modern, configurable logger for Node.js.                                                        |
| **[ngeohash](https://github.com/sunng87/node-ngeohash)** | A library for geohashing, used for efficient geographic queries.                                    |
