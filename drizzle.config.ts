import { defineConfig, Config } from 'drizzle-kit';
import { config } from './config';

const postgresConfig: Config = {
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
}

const pgliteConfig: Config = {
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  driver: 'pglite',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};

export default defineConfig(
  config.db.dialect === 'pglite' ? pgliteConfig : postgresConfig
);
