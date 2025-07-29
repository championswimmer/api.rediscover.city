import { describe, it, expect } from "bun:test";
import { getLocationInfo } from "./locationinfo";

describe("locationinfo", () => {
  it("should get location info for Empire State Building", async () => {
    const result = await getLocationInfo({
      geohash: "dr5ru7j", // Empire State Building
      country: "United States",
      city: "New York",
      locality: "Manhattan",
      sublocality: "Midtown",
      neighborhood: "Koreatown",
      street: "West 34th Street",
    });

    console.log(result);

    expect(result.name).toBeString();
    expect(result.description).toBeString();
    expect(result.history).toBeString();
    expect(result.culture).toBeString();
    expect(result.attractions).toBeArray();
    expect(result.climate).toBeString();
    expect(result.demographics).toBeString();
    expect(result.economy).toBeString();
  }, { timeout: 10000 });

  it("should get location info for Buckingham Palace", async () => {
    const result = await getLocationInfo({
      geohash: "gcpvj2t", // Buckingham Palace
      country: "United Kingdom",
      city: "London",
      locality: "City of Westminster",
      sublocality: "St. James's",
      neighborhood: "St. James's",
      street: "Spur Road",
    });

    console.log(result);

    expect(result.name).toBeString();
    expect(result.description).toBeString();
    expect(result.history).toBeString();
    expect(result.culture).toBeString();
    expect(result.attractions).toBeArray();
    expect(result.climate).toBeString();
    expect(result.demographics).toBeString();
    expect(result.economy).toBeString();
  }, { timeout: 10000 });

  it("should get location info for India Gate", async () => {
    const result = await getLocationInfo({
      geohash: "ttn31e8", // India Gate
      country: "India",
      city: "New Delhi",
      locality: "New Delhi",
      sublocality: "Connaught Place",
      neighborhood: "India Gate",
      street: "Kartavya Path",
    });

    console.log(result);

    expect(result.name).toBeString();
    expect(result.description).toBeString();
    expect(result.history).toBeString();
    expect(result.culture).toBeString();
    expect(result.attractions).toBeArray();
    expect(result.climate).toBeString();
    expect(result.demographics).toBeString();
    expect(result.economy).toBeString();
  }, { timeout: 10000 });
}); 