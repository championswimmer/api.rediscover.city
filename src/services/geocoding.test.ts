import { describe, it, expect } from "bun:test";
import { reverseGeocode } from "./geocoding";

describe("geocoding", () => {
  it("should reverse geocode New York City coordinates", async () => {
    const result = await reverseGeocode({
      lat: "40.7128",
      lng: "-74.0060"
    });

    expect(result.geohash).toBeString();
    expect(result.country).toBe("United States");
    expect(result.city).toBe("New York");
    expect(result.locality).toBeString();
    expect(result.neighborhood).toBeString();
    expect(result.street).toBeString();
  });

  it("should reverse geocode London coordinates", async () => {
    const result = await reverseGeocode({
      lat: "51.5074",
      lng: "-0.1278"
    });

    expect(result.geohash).toBeString();
    expect(result.country).toBe("United Kingdom");
    expect(result.city).toBe("London");
    expect(result.locality).toBeString();
    expect(result.neighborhood).toBeString();
    expect(result.street).toBeString();
  });

  it("should reverse geocode coordinates in India", async () => {
    const result = await reverseGeocode({
      lat: "28.6139",
      lng: "77.2090"
    });

    expect(result.geohash).toBeString();
    expect(result.country).toBe("India");
    expect(result.city).toBe("New Delhi");
    expect(result.locality).toBeString();
    expect(result.neighborhood).toBeString();
    expect(result.street).toBeString();
  });

  it("should handle coordinates in the middle of ocean", async () => {
    const result = await reverseGeocode({
      lat: "0",
      lng: "0"
    });

    expect(result.geohash).toBeString();
    expect(result.country).toBe("");
    expect(result.city).toBe("");
    expect(result.locality).toBe("");
    expect(result.neighborhood).toBe("");
    expect(result.street).toBe("");
  });
});