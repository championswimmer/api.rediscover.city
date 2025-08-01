import { pgTable, varchar, point, text, jsonb } from "drizzle-orm/pg-core";
import { LocationInfoResponse } from "../services/locationinfo";

export const geohashTable = pgTable("geohash", {
  geohash: varchar({ length: 10 }).primaryKey(),
  geopoint: point({ mode: "xy" }).notNull(),
  country: varchar({ length: 48 }).notNull(),
  city: varchar({ length: 64 }).notNull(),
  locality: varchar({ length: 64 }).notNull(),
  sublocality: varchar({ length: 64 }).notNull(),
  neighborhood: varchar({ length: 64 }).notNull(),
  street: varchar({ length: 64 }).notNull(),
});

export const locationInfoTable = pgTable("location_info", {
  geohash: varchar({ length: 10 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  history: text("history").notNull(),
  culture: text("culture").notNull(),
  attractions: jsonb("attractions").array().$type<LocationInfoResponse["attractions"]>().notNull(),
  climate: text("climate").notNull(),
  demographics: text("demographics").notNull(),
  economy: text("economy").notNull(),
});

export type GeohashModel = typeof geohashTable.$inferSelect;
export type LocationInfoModel = typeof locationInfoTable.$inferSelect;
