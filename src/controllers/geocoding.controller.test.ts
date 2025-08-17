import { describe, it, expect } from "bun:test";
import { GeocodingController } from "../controllers/geocoding.controller";
import { db } from "../db/init";

describe("GeocodingController", () => {
  const controller = new GeocodingController(db);

  describe("City Filter", () => {
    it("should validate NYC coordinates as enabled", () => {
      const result = controller.validateCoordinatesEnabled(40.7128, -74.0060);
      
      expect(result.isEnabled).toBe(true);
      expect(result.enabledCities).toBeInstanceOf(Array);
      expect(result.enabledCities.length).toBeGreaterThan(0);
    });

    it("should validate London coordinates as enabled", () => {
      const result = controller.validateCoordinatesEnabled(51.5074, -0.1278);
      
      expect(result.isEnabled).toBe(true);
      expect(result.enabledCities).toBeInstanceOf(Array);
    });

    it("should validate New Delhi coordinates as enabled", () => {
      const result = controller.validateCoordinatesEnabled(28.6139, 77.2090);
      
      expect(result.isEnabled).toBe(true);
      expect(result.enabledCities).toBeInstanceOf(Array);
    });

    it("should reject ocean coordinates as disabled", () => {
      const result = controller.validateCoordinatesEnabled(0, 0);
      
      expect(result.isEnabled).toBe(false);
      expect(result.enabledCities).toBeInstanceOf(Array);
      expect(result.enabledCities.length).toBeGreaterThan(0);
      
      // Check that the enabled cities list contains expected cities
      const cityNames = result.enabledCities.map(c => c.city);
      expect(cityNames).toContain("New York");
      expect(cityNames).toContain("London");
      expect(cityNames).toContain("New Delhi");
    });

    it("should reject Antarctica coordinates as disabled", () => {
      const result = controller.validateCoordinatesEnabled(-85, 0);
      
      expect(result.isEnabled).toBe(false);
      expect(result.enabledCities).toBeInstanceOf(Array);
    });

    it("should have proper structure for validation result", () => {
      const result = controller.validateCoordinatesEnabled(40.7128, -74.0060);
      
      expect(result).toHaveProperty("isEnabled");
      expect(result).toHaveProperty("enabledCities");
      expect(typeof result.isEnabled).toBe("boolean");
      expect(Array.isArray(result.enabledCities)).toBe(true);
      
      result.enabledCities.forEach(city => {
        expect(city).toHaveProperty("city");
        expect(city).toHaveProperty("country");
        expect(typeof city.city).toBe("string");
        expect(typeof city.country).toBe("string");
      });
    });
  });
});