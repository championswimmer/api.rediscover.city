import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { LocationInfoResponse } from "../services/locationinfo";

export type SQLitePointType = {
  x: number;
  y: number;
}

export const geohashTable = sqliteTable("geohash", {
  geohash: text({ length: 10 }).primaryKey(),
  geopoint: text({ mode: "json" }).$type<SQLitePointType>().notNull(), // SQLite doesn't have a native point type, store as JSON object
  country: text({ length: 48 }).notNull(),
  city: text({ length: 64 }).notNull(),
  locality: text({ length: 64 }).notNull(),
  neighborhood: text({ length: 64 }).notNull(),
  street: text({ length: 64 }).notNull(),
});

export const locationInfoTable = sqliteTable("location_info", {
  geohash: text({ length: 10 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  history: text("history").notNull(),
  culture: text("culture").notNull(),
  attractions: text("attractions", { mode: "json" }).$type<LocationInfoResponse["attractions"]>().notNull(), // Store JSON array as text
  climate: text("climate").notNull(),
  demographics: text("demographics").notNull(),
  economy: text("economy").notNull(),
});

export type GeohashModel = typeof geohashTable.$inferSelect;
export type LocationInfoModel = typeof locationInfoTable.$inferSelect;
