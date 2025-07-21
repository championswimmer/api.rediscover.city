import adze from "adze";
import { drizzle } from "drizzle-orm/bun-sql";
import { DefaultLogger } from "drizzle-orm/logger";

const logger = new DefaultLogger({
  writer: {
    write: (message) => {
      adze.ns("drizzle").debug(message);
    }
  }
})

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  logger
});
