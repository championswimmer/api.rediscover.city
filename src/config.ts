import { ElysiaSwaggerConfig } from "@elysiajs/swagger";
import dotenv from "dotenv";
import { Level } from "adze";

// first load default env
dotenv.config({ path: ".env" });
// override with local env if exists 
dotenv.config({ path: ".env.local" });
// override with production env if exists
dotenv.config({ path: ".env.production" });

export const config = {
  port: process.env.PORT || 3000,
  keys: {
    perplexity: process.env.PERPLEXITY_API_KEY!,
    googlemaps: process.env.GOOGLE_MAPS_API_KEY!,
    googleai: process.env.GOOGLE_AI_API_KEY!,
  },
  swaggerConfig: <ElysiaSwaggerConfig>{
    documentation: {
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
          name: "geocoding",
          description: "Geocoding API"
        },
        {
          name: "location",
          description: "Location Information API"
        }
      ]
    }
  },
  geohashPrecision: 7,
  logs: {
    emoji: true,
    level: <Level>(process.env.NODE_ENV === "production" ? 'warn' : 'debug'),
  }
};
