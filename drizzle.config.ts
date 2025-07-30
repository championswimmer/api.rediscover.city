import './src/config';
import { defineConfig } from 'drizzle-kit';

let schemaPath = './src/db/schema.ts';
let dialect: "postgresql" | "sqlite" = 'postgresql';
if (process.env.DB_DIALECT === 'sqlite') {
  schemaPath = './src/db/schema.ts';
  dialect = 'sqlite';
}
export default defineConfig({
  out: './drizzle',
  schema: schemaPath,
  dialect: dialect,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
