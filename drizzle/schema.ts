import { pgTable, varchar, text, jsonb, point } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const locationInfo = pgTable("location_info", {
	geohash: varchar({ length: 10 }).primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	history: text().notNull(),
	culture: text().notNull(),
	attractions: jsonb().array().notNull(),
	climate: text().notNull(),
	demographics: text().notNull(),
	economy: text().notNull(),
});

export const geohash = pgTable("geohash", {
	geohash: varchar({ length: 10 }).primaryKey().notNull(),
	geopoint: point().notNull(),
	country: varchar({ length: 48 }).notNull(),
	city: varchar({ length: 64 }).notNull(),
	locality: varchar({ length: 64 }).notNull(),
	neighborhood: varchar({ length: 64 }).notNull(),
	street: varchar({ length: 64 }).notNull(),
	sublocality: varchar({ length: 64 }),
});
