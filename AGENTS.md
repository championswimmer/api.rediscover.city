# AGENTS.md - Guidelines for LLM Agents

This document provides guidelines for LLM agents working on the Rediscover City API codebase. It covers the technology stack, coding conventions, and best practices to ensure consistency and quality in generated code.

## Technology Stack

The Rediscover City API is built with the following technologies:

- **Runtime**: [Bun](https://bun.sh/) - A fast JavaScript runtime with built-in TypeScript support
- **Framework**: [ElysiaJS](https://elysiajs.com/) - A fast, ergonomic, and type-safe web framework for Bun
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for SQL databases
- **Testing**: Bun's built-in test runner with [@electric-sql/pglite](https://github.com/electric-sql/pglite) for in-memory PostgreSQL testing
- **Authentication**: JWT tokens with [@elysiajs/jwt](https://elysiajs.com/plugins/jwt.html)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) with multiple providers:
  - Google AI (Gemini models)
  - Perplexity AI (Sonar models)
  - OpenAI (GPT models)
- **Geospatial**: [ngeohash](https://github.com/sunng87/node-ngeohash) for geohashing coordinates
- **Logging**: [Adze](https://github.com/AJ-Can-Code/adze) - A modern, configurable logger
- **Validation**: [TypeBox](https://github.com/sinclairzx81/typebox) with [@typeschema/typebox](https://github.com/decs/typeschema) for JSON schema validation
- **API Documentation**: [@elysiajs/swagger](https://elysiajs.com/plugins/swagger.html) for OpenAPI/Swagger documentation
- **CORS**: [@elysiajs/cors](https://elysiajs.com/plugins/cors.html) for Cross-Origin Resource Sharing handling

## Project Structure

The project follows a modular architecture with clear separation of concerns:

```
src/
├── controllers/          # Business logic and database operations
├── db/                   # Database configuration and schema definitions
├── prompts/              # AI prompt templates for content generation
├── routes/               # API route definitions with validation
├── services/             # External service integrations and core logic
└── index.ts              # Application entry point
```

## Code Style and Conventions

### TypeScript Usage

- Strict TypeScript mode is enabled (`strict: true` in tsconfig.json)
- Use of TypeBox for runtime validation and type inference
- Explicit typing for all functions, variables, and return values
- Use of `Static<typeof schema>` to extract TypeScript types from TypeBox schemas

### Architecture Patterns

- **Controller-Service Pattern**: Controllers handle business logic and database operations, while services handle external API integrations
- **Route Validation**: All routes use TypeBox schemas for request/response validation
- **Dependency Injection**: Database connections and controllers are injected via Elysia's `decorate` method
- **Centralized Configuration**: All configuration is managed through a single `config.ts` file
- **Caching Strategy**: Database tables are used as caches for expensive operations (geocoding, AI generation)

### Naming Conventions

- File names: Use kebab-case (e.g., `geocoding.controller.ts`)
- Class names: Use PascalCase (e.g., `GeocodingController`)
- Function names: Use camelCase (e.g., `reverseGeocode`)
- Variable names: Use camelCase (e.g., `geohashRecord`)
- Type names: Use PascalCase with "Schema" suffix for TypeBox schemas (e.g., `ReverseGeocodeRequestSchema`)
- Test files: Use the same name as the implementation file with `.test.ts` suffix

### Import/Export Patterns

- Use of relative imports (e.g., `import { config } from "../../config"`)
- Default exports for route files (e.g., `export default route`)
- Named exports for service and controller functions
- Explicit imports of only required functions/variables

### Error Handling

- Use of Elysia's `set.status` to set HTTP response codes
- Return structured error responses with consistent properties
- Proper logging of errors and debug information using Adze

### Testing

- Tests are colocated with implementation files
- Use of Bun's built-in test runner (`bun:test`)
- Test files follow the pattern: `*.test.ts`
- Use of descriptive test names that explain the expected behavior
- Tests cover both positive and negative cases

## Frameworks and Libraries

### Core Framework - ElysiaJS

ElysiaJS is a fast, ergonomic, and type-safe web framework for Bun. Key features used in this project:

- Route grouping with prefixes
- Middleware plugins (JWT, CORS, Swagger, Server Timing)
- Request/response validation using TypeBox schemas
- Decorators for dependency injection
- Built-in TypeScript support with type inference

### Database - Drizzle ORM

Drizzle ORM is used for database operations with PostgreSQL. Patterns observed:

- Schema definitions using `pgTable` and column types
- Type-safe queries with `select`, `insert`, `delete`, `update`
- Use of `eq` and other operators for where clauses
- Model types inferred using `$inferSelect` and `$inferInsert`

### AI Integration - Vercel AI SDK

The Vercel AI SDK is used to integrate with multiple AI providers:

- `generateObject` for structured output generation
- `generateText` for unstructured text generation
- Model abstraction allowing switching between providers
- JSON schema validation for AI-generated objects

### Logging - Adze

Adze is used for application logging:

- Structured logging with `adze.info`, `adze.debug`, etc.
- Emoji support in logs (can be disabled in production)
- Different log levels based on environment

## Do's and Don'ts for LLM Agents

### Do's

1. **DO** follow the existing project structure when adding new files
2. **DO** use TypeBox schemas for request/response validation
3. **DO** implement controllers and services following the existing patterns
4. **DO** add proper logging with Adze for debugging and monitoring
5. **DO** use camelCase for variables and functions, PascalCase for classes and types
6. **DO** colocate test files with implementation files using the `.test.ts` suffix
7. **DO** use dependency injection via Elysia's `decorate` method
8. **DO** handle errors by setting appropriate HTTP status codes and returning structured error responses
9. **DO** use the existing configuration patterns in `config.ts`
10. **DO** follow the controller-service-route architecture pattern
11. **DO** use explicit typing and avoid `any` types
12. **DO** write descriptive test names that explain the expected behavior

### Don'ts

1. **DON'T** use external dependencies without checking if similar functionality already exists in the project
2. **DON'T** create new configuration files outside of `config.ts`
3. **DON'T** bypass the existing validation schemas
4. **DON'T** use inconsistent naming conventions
5. **DON'T** ignore error handling patterns
6. **DON'T** create new logging mechanisms - use the existing Adze setup
7. **DON'T** directly access environment variables - use the config object
8. **DON'T** create new database connection methods - use the existing db instance
9. **DON'T** use different architectural patterns than those already established
10. **DON'T** generate code that doesn't follow TypeScript strict mode requirements

## Example Patterns

### Route Definition

```typescript
const route = new Elysia({ prefix: "/endpoint" })
  .use(jwt({ name: "jwt", secret: config.keys.jwt }))
  .decorate("ctrl", new Controller(db))
  .get("/", async ({ query, ctrl, headers, jwt, set }) => {
    // Authentication
    const authResult = await authCtrl.authenticateRequest(headers, jwt, set);
    if (authResult.error) return authResult.error;
    
    // Business logic
    return await ctrl.method(query.param);
  }, {
    query: RequestSchema,
    response: {
      200: ResponseSchema,
      401: t.Object({ message: t.String() }),
    },
    description: "Route description",
    tags: ["api-tag"],
    detail: { security: [{ bearerAuth: [] }] }
  });
```

### Controller Pattern

```typescript
export class ExampleController {
  private readonly db: DatabaseType;
  
  constructor(db: DatabaseType) {
    this.db = db;
  }
  
  async exampleMethod(param: string): Promise<ExampleResponse> {
    adze.info("Method description", { param });
    
    // Database operations
    const record = await this.db.select().from(table).where(eq(table.column, param));
    
    if (record.length > 0) {
      adze.debug("Record found", { param, record });
      return record[0];
    }
    
    // If not found, call service
    const response = await serviceMethod({ param });
    
    // Cache in database
    await this.db.insert(table).values({ column: param, ...response });
    
    return response;
  }
}
```

### Service Pattern

```typescript
export const ExampleRequestSchema = t.Object({
  param: t.String({ examples: ["example"] }),
});

export type ExampleRequest = Static<typeof ExampleRequestSchema>;

export const ExampleResponseSchema = t.Object({
  result: t.String({ examples: ["result"] }),
});

export type ExampleResponse = Static<typeof ExampleResponseSchema>;

async function serviceMethod(request: ExampleRequest): Promise<ExampleResponse> {
  // External API calls
  const response = await externalAPI.call({
    params: { key: config.keys.api, ...request }
  });
  
  // Process response
  return { result: response.data.result };
}

export { serviceMethod };
```

### Test Pattern

```typescript
import { describe, it, expect } from "bun:test";
import { method } from "./file";

describe("component", () => {
  it("should handle specific case", async () => {
    const result = await method({ param: "value" });
    
    expect(result.property).toBe("expectedValue");
    expect(result).toBeInstanceOf(Object);
  });
});