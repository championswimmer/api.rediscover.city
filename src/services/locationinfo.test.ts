import { describe, it, expect } from "bun:test";
import { getLocationInfo } from "./locationinfo";

describe("locationinfo", () => {
  it("should get location info for Astoria, Queens, NYC", async () => {
    const result = await getLocationInfo({
      "geohash": "dr5rveg",
      "country": "United States",
      "city": "New York",
      "locality": "Queens",
      "sublocality": "",
      "neighborhood": "Astoria",
      "street": "Crescent Street"
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
  }, { timeout: 20000 });

  it("should get location info for Fulham, London", async () => {
    const result = await getLocationInfo({
      "geohash": "gcpug5z",
      "country": "United Kingdom",
      "city": "London",
      "locality": "Fulham",
      "sublocality": "",
      "neighborhood": "",
      "street": "Varna Road"
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
  }, { timeout: 20000 });

  it("should get location info for Janakpuri District Center, New Delhi", async () => {
    const result = await getLocationInfo({
      "geohash": "ttnfcgy",
      "country": "India",
      "city": "Delhi",
      "locality": "District Centre",
      "sublocality": "Janakpuri",
      "neighborhood": "",
      "street": "Najafgarh Road"
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
  }, { timeout: 20000 });
}); 