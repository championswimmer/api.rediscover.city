import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type SQLitePointType = {
  x: number;
  y: number;
}
export const geohashTable = sqliteTable("geohash", {
  geohash: text({ length: 10 }).primaryKey(),
  geopoint: text({ mode: "json" }).$type<SQLitePointType>().notNull(), // SQLite doesn't have a native point type, store as string "x,y"
  country: text({ length: 48 }).notNull(),
  city: text({ length: 64 }).notNull(),
  locality: text({ length: 64 }).notNull(),
  neighborhood: text({ length: 64 }).notNull(),
  street: text({ length: 64 }).notNull(),
});

export const locationInfoTable = sqliteTable("location_info", {
  geohash: text({ length: 10 }).primaryKey(),
});

export type GeohashModel = typeof geohashTable.$inferSelect;
