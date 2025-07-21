import { pgTable, varchar, point } from "drizzle-orm/pg-core";

export const geohashTable = pgTable("geohash", {
  geohash: varchar({ length: 10 }).primaryKey(),
  geopoint: point({ mode: "xy" }).notNull(),
  country: varchar({ length: 48 }).notNull(),
  city: varchar({ length: 64 }).notNull(),
  locality: varchar({ length: 64 }).notNull(),
  neighborhood: varchar({ length: 64 }),
  street: varchar({ length: 64 }),
});

export const locationInfoTable = pgTable("location_info", {
  geohash: varchar({ length: 10 }).primaryKey(),
});

export type GeohashModel = typeof geohashTable.$inferSelect;
