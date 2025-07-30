import * as postgresSchema from './schema.postgres';
import * as sqliteSchema from './schema.sqlite';

// Dynamic schema loading based on DB_DIALECT
const dialect = process.env.DB_DIALECT || 'postgresql';

const schema = dialect === 'sqlite' ? sqliteSchema : postgresSchema;

export const geohashTable = schema.geohashTable;
export const locationInfoTable = schema.locationInfoTable;
export type GeohashModel = typeof schema.GeohashModel;
export type LocationInfoModel = typeof schema.LocationInfoModel;