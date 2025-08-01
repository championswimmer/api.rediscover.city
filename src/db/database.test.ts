import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { db as testDb } from "../db/init";
import { geohashTable, locationInfoTable } from "../db/schema";
import { eq } from "drizzle-orm";
import adze from "adze";

describe("database configuration", () => {
  const db = testDb;
  beforeAll(async () => {
    // Clean up any existing test data
    try {
      await db.delete(geohashTable);
      await db.delete(locationInfoTable);
    } catch (error) {
      adze.ns("db:test").error("Error cleaning up test data", { error });
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await db.delete(geohashTable);
      await db.delete(locationInfoTable);
    } catch (error) {
      adze.ns("db:test").error("Error cleaning up test data", { error });
    }
  });

  it("should create and query geohash records", async () => {
    const testGeohash = {
      geohash: "test123",
      geopoint: { x: -74.0060, y: 40.7128 },
      country: "Test Country",
      city: "Test City",
      locality: "Test Locality",
      neighborhood: "Test Neighborhood",
      street: "Test Street"
    };

    // Insert test record
    await db.insert(geohashTable).values(testGeohash);

    // Query the record
    const records = await db.select()
      .from(geohashTable)
      .where(eq(geohashTable.geohash, "test123"));

    expect(records).toHaveLength(1);
    expect(records[0].geohash).toBe("test123");
    expect(records[0].country).toBe("Test Country");
    expect(records[0].city).toBe("Test City");
  });

  it("should create and query location info records", async () => {
    const testLocationInfo = {
      geohash: "test456",
      name: "Test Location",
      description: "Test Description",
      history: "Test History",
      culture: "Test Culture",
      attractions: [{ name: "Test Attraction", distance: "100m", whyVisit: "Test Why Visit" }],
      climate: "Test Climate",
      demographics: "Test Demographics",
      economy: "Test Economy"
    };

    // Insert test record
    await db.insert(locationInfoTable).values(testLocationInfo);

    // Query the record
    const records = await db.select()
      .from(locationInfoTable)
      .where(eq(locationInfoTable.geohash, "test456"));

    expect(records).toHaveLength(1);
    expect(records[0].geohash).toBe("test456");
    expect(records[0].name).toBe("Test Location");
    expect(records[0].description).toBe("Test Description");
  });
});