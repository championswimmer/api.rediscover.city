import { ElysiaSwaggerConfig } from "@elysiajs/swagger";
import dotenv from "dotenv";
import adze, { Level } from "adze";

// first load default env
dotenv.config({ path: ".env" });

// override with test env if running tests
if (process.env.NODE_ENV === "test" || process.argv.includes("test")) {
  adze.info("Loading test environment variables");
  dotenv.config({ path: ".env.test", override: true });
} else {
  // override with production env if exists (only if not in testing)
  adze.info("Loading production environment variables");
  dotenv.config({ path: ".env.production", override: true });
}

// when dev mode, override with local env if exists
if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: ".env.local", override: true });
}

let apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3000";

if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  adze.info("Using Railway public domain for API base URL", process.env.RAILWAY_PUBLIC_DOMAIN);
  apiBaseUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
}

export const config = {
  db: {
    url: process.env.DATABASE_URL!,
    dialect: process.env.DB_DIALECT || "postgres", // default to postgres if not set
  },
  port: process.env.PORT || 3000,
  keys: {
    perplexity: process.env.PERPLEXITY_API_KEY!,
    googlemaps: process.env.GOOGLE_MAPS_API_KEY!,
    googleai: process.env.GOOGLE_AI_API_KEY!,
    openai: process.env.OPENAI_API_KEY!,
    posthog: process.env.POSTHOG_API_KEY,
    jwt: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
    googleOAuth: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    }
  },
  swaggerConfig: <ElysiaSwaggerConfig>{
    documentation: {
      servers: [
        {
          url: apiBaseUrl,
        }
      ],
      info: {
        title: "Rediscover City API",
        description: "API for the Rediscover City project",
        version: "1.0.0",
        contact: {
          name: "Rediscover City",
          url: "https://rediscover.city",
        },
      },
      tags: [
        {
          name: "auth",
          description: "Authentication API"
        },
        {
          name: "geocoding",
          description: "Geocoding API"
        },
        {
          name: "location",
          description: "Location Information API"
        },
        {
          name: "waitlist",
          description: "Waitlist Subscription API"
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    }
  },
  geohashPrecision: Number(process.env.GEOHASH_PRECISION) || 7,
  logs: {
    emoji: true,
    level: <Level>(process.env.NODE_ENV === "production" ? 'log' : 'verbose'),
  },
  cors: {
    origin: [
      "https://rediscover.city",
      "https://app.rediscover.city",
      "https://rediscover-city.lovable.app",
      "https://rediscover-city.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  aiModel: process.env.AI_MODEL || "google/gemini-2.5-flash-lite"
};