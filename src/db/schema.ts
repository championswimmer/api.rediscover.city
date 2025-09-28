import { pgTable, varchar, point, text, jsonb, timestamp, uuid, } from "drizzle-orm/pg-core";
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
  geohash: varchar({ length: 10 }).notNull(),
  language: varchar({ length: 20 }).default('english').notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  history: text("history").notNull(),
  culture: text("culture").notNull(),
  attractions: jsonb("attractions").array().$type<LocationInfoResponse["attractions"]>().notNull(),
  climate: text("climate").notNull(),
  demographics: text("demographics").notNull(),
  economy: text("economy").notNull(),
}, (table) => ({
  pk: {
    columns: [table.geohash, table.language],
    name: "location_info_pkey",
  },
}));


export const googleOauthTable = pgTable("google_oauth", {
  userId: uuid("user_id").primaryKey().references(() => usersTable.id),
  googleId: varchar("google_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
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
export type LocationInfoModel = typeof locationInfoTable.$inferSelect & {
  language: string;
};
export type UserModel = typeof usersTable.$inferSelect;
export type NewUserModel = typeof usersTable.$inferInsert;
export type InviteModel = typeof invitesTable.$inferSelect;
export type NewInviteModel = typeof invitesTable.$inferInsert;
export type WaitlistModel = typeof waitlistTable.$inferSelect;
export type NewWaitlistModel = typeof waitlistTable.$inferInsert;
export type GoogleOauthModel = typeof googleOauthTable.$inferSelect;
export type NewGoogleOauthModel = typeof googleOauthTable.$inferInsert;
