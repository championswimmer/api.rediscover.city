# Rediscover City API

A REST API built with ElysiaJS and Bun runtime for the Rediscover City web application. This API provides geocoding services and AI-powered location information with integrations to Google Maps, Google Gemini, Perplexity, and OpenAI.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository

**CRITICAL: Install Bun Runtime First**
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

**Install Dependencies and Build:**
```bash
bun install    # Takes <1 second for existing installs, ~30 seconds for fresh install. NEVER CANCEL.
bun run build  # Takes ~0.1 seconds - very fast build process
```

**Run Tests:**
```bash
bun test       # Takes ~4 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
```
Note: Some tests may fail due to missing API keys (GOOGLE_AI_API_KEY, GOOGLE_MAPS_API_KEY, PERPLEXITY_API_KEY, OPENAI_API_KEY) or network restrictions. This is expected in development environments without proper API keys configured. Auth and database tests should pass.

**Run Development Server:**
```bash
bun run dev    # Starts server with live reload on http://localhost:3000
```

**Run Production Server:**
```bash
bun run start  # Runs the built application from dist/index.js
```
Note: Production server requires a PostgreSQL database connection. Local PGLite database files need to be accessible relative to the dist/ directory.

## Environment Configuration

The application uses a hierarchical environment configuration system:
- `.env` - Default environment variables
- `.env.local` - Local development overrides (not committed)
- `.env.test` - Test environment - automatically loaded during tests
- `.env.production` - Production overrides

**Required Environment Variables for Full Functionality:**
```bash
DATABASE_URL="your-postgres-connection-string"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"
PERPLEXITY_API_KEY="your-perplexity-api-key"
OPENAI_API_KEY="your-openai-api-key"
JWT_SECRET="your-jwt-secret"
```

**Test Environment Configuration:**
The test environment uses PGLite (embedded PostgreSQL) by default:
```bash
DB_DIALECT="pglite"
DATABASE_URL="./postgres_test_data"
```

## Database Setup

**Schema Management:**
```bash
bunx drizzle-kit push --force  # Apply schema changes to database
bunx drizzle-kit generate       # Generate migration files
```

The pretest script automatically runs `drizzle-kit push --force` before tests.

## API Structure and Validation

**API Endpoints:**
- `/swagger` - Interactive API documentation
- `/v1/auth/*` - Authentication endpoints (login, register)
- `/v1/locate` - Reverse geocoding (requires JWT auth)
- `/v1/location/*` - Location information endpoints (requires JWT auth)

**Authentication:**
All API endpoints except `/swagger` require JWT authentication via Authorization header:
```bash
Authorization: Bearer <jwt-token>
```

**Manual Validation Steps:**
1. Start the development server: `bun run dev`
2. Visit `http://localhost:3000/swagger` to view API documentation
3. Test user registration: 
   ```bash
   curl -X POST "http://localhost:3000/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpassword123"}'
   ```
4. Test user login:
   ```bash
   curl -X POST "http://localhost:3000/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpassword123"}'
   ```
5. Extract the JWT token from the response
6. Test protected endpoints with the JWT token:
   ```bash
   curl "http://localhost:3000/v1/locate?lat=40.7128&lng=-74.0060" \
     -H "Authorization: Bearer <jwt-token>"
   ```
7. Verify the server responds appropriately (should work with valid API keys, or show expected error messages without them)

**Expected Results:**
- Registration and login should return valid JWT tokens
- Swagger UI should be accessible and show API documentation  
- Protected endpoints should require valid JWT authentication
- Without external API keys, geocoding/AI services will fail gracefully with appropriate error messages

## Validation

**Always run these validation steps after making changes:**
1. `bun run build` - Ensure the application builds successfully
2. `bun test` - Run the test suite (expect some failures without API keys)
3. `bun run dev` - Start development server and verify it starts without errors
4. Test API endpoints manually through Swagger UI or curl

**CI/CD Validation:**
The GitHub Actions workflow (`.github/workflows/ci.yml`) validates:
- Dependency installation
- Build process
- Test execution

## Timing Expectations

- **Dependency Installation**: <1 second for existing, ~30 seconds for fresh install
- **Build Process**: ~0.1 seconds (very fast due to Bun's performance)
- **Test Suite**: ~4 seconds (may vary based on API key availability and network access)
- **Development Server Startup**: ~2 seconds

**NEVER CANCEL these operations - set appropriate timeouts:**
- bun install: timeout 60+ seconds (for fresh installs)
- bun test: timeout 30+ seconds

## Common Tasks

### Repository Structure
```
src/
├── controllers/          # Business logic and database operations
├── db/                   # Database configuration and schema definitions
├── prompts/              # AI prompt templates for content generation
├── routes/               # API route definitions with validation
├── services/             # External service integrations and core logic
└── index.ts              # Application entry point

Key files:
├── config.ts             # Application configuration
├── drizzle.config.ts     # Database migration configuration
├── package.json          # Dependencies and scripts
├── Dockerfile            # Container configuration
└── docker-compose.yml    # Local development setup
```

### Key Dependencies
- **ElysiaJS**: TypeScript-first web framework
- **Drizzle ORM**: Type-safe database operations
- **Bun**: Runtime and package manager
- **@ai-sdk/***: AI model integrations
- **@googlemaps/google-maps-services-js**: Google Maps API integration

### Codebase Architecture
The application follows a layered architecture:
1. **Routes** - API endpoint definitions with TypeBox schema validation
2. **Controllers** - Business logic coordination
3. **Services** - External API integrations and core functionality
4. **Database** - PostgreSQL with Drizzle ORM

### Core Services
- **GeocodingController**: Handles reverse geocoding and geohash management
- **LocationController**: Manages location information retrieval and caching
- **AuthController**: User authentication and JWT management

### Making Changes
1. Always run `bun run build` after code changes
2. Test changes with `bun test`
3. Manually verify API functionality through development server
4. Check that authentication flows work correctly
5. Validate external API integrations when API keys are available

### Troubleshooting
- **Build Failures**: Check TypeScript compilation errors
- **Test Failures**: Verify database connectivity and API key configuration
- **Runtime Errors**: Check environment variables and database connection
- **API Errors**: Verify JWT authentication and request validation

## Docker Support

The repository includes Docker configuration:
```bash
docker build -t api.rediscover.city .  # Takes ~2-5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
docker-compose up -d  # Starts with PostgreSQL database
```

Note: Docker builds may fail in sandboxed environments due to certificate restrictions during dependency installation. Always prefer `bun` commands for development over Docker for faster iteration.