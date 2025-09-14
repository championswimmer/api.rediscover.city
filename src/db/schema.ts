import { pgTable, varchar, point, text, jsonb, timestamp, uuid } from "drizzle-orm/pg-core";
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

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"), // Made optional for OAuth users
  googleId: varchar("google_id", { length: 255 }).unique(), // Google OAuth ID
  googleAccessToken: text("google_access_token"), // Store Google access token
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invitesTable = pgTable("invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 8 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waitlistTable = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type GeohashModel = typeof geohashTable.$inferSelect;
export type LocationInfoModel = typeof locationInfoTable.$inferSelect;
export type UserModel = typeof usersTable.$inferSelect;
export type NewUserModel = typeof usersTable.$inferInsert;
export type InviteModel = typeof invitesTable.$inferSelect;
export type NewInviteModel = typeof invitesTable.$inferInsert;
export type WaitlistModel = typeof waitlistTable.$inferSelect;
export type NewWaitlistModel = typeof waitlistTable.$inferInsert;
