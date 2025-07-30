import adze from "adze";
import { drizzle as drizzlePostgres } from "drizzle-orm/bun-sql";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite";
import { DefaultLogger } from "drizzle-orm/logger";
import { Database } from "bun:sqlite";

const logger = new DefaultLogger({
  writer: {
    write: (message) => {
      adze.ns("drizzle").debug(message);
    }
  }
})

// Create database connection based on dialect
const createDatabase = () => {
  const dialect = process.env.DB_DIALECT || 'postgresql';
  const databaseUrl = process.env.DATABASE_URL!;
  
  if (dialect === 'sqlite') {
    const sqlite = new Database(databaseUrl);
    return drizzleSqlite(sqlite, { logger });
  } else {
    return drizzlePostgres({
      connection: databaseUrl,
      logger
    });
  }
};

export const db = createDatabase();
export type DatabaseType = ReturnType<typeof createDatabase>;
