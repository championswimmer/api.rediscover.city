import * as postgresSchema from './schema.postgres';

// Directly export PostgreSQL schema as we're removing SQLite support
export const geohashTable = postgresSchema.geohashTable;
export const locationInfoTable = postgresSchema.locationInfoTable;
export type GeohashModel = typeof postgresSchema.geohashTable.$inferSelect;
export type LocationInfoModel = typeof postgresSchema.locationInfoTable.$inferSelect;