import adze from "adze";
import { config } from "../../config";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite"
import { drizzle as drizzlePostgres } from "drizzle-orm/bun-sql";
import { DefaultLogger } from "drizzle-orm/logger";
import { PGlite } from "@electric-sql/pglite";

const logger = new DefaultLogger({
  writer: {
    write: (message) => {
      adze.ns("drizzle").debug(message);
    }
  }
})

// Create PostgreSQL database connection
const createDatabase = () => {
  const databaseUrl = config.db.url;
  adze.ns("db").info("Creating PostgreSQL database connection", { databaseUrl });

  if (config.db.dialect === "pglite") {
    const client = new PGlite(databaseUrl) // when using PGlite, no db url. db is in memory
    return drizzlePglite(client, { logger });
  }

  return drizzlePostgres({
    connection: databaseUrl,
    logger
  });
};

export const db = createDatabase();
export type DatabaseType = ReturnType<typeof createDatabase>;
