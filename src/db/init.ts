import adze from "adze";
import { config } from "../config";
import { drizzle as drizzlePostgres } from "drizzle-orm/bun-sql";
import { DefaultLogger } from "drizzle-orm/logger";

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

  return drizzlePostgres({
    connection: databaseUrl,
    logger
  });
};

export const db = createDatabase();
export type DatabaseType = ReturnType<typeof createDatabase>;
