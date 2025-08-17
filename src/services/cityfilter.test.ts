import { describe, it, expect } from "bun:test";
import { checkCityEnabled, getEnabledCities } from "./cityfilter";

describe("cityfilter", () => {
  it("should return true for coordinates within New York", () => {
    // NYC coordinates: 40.7128, -74.0060
    const result = checkCityEnabled(40.7128, -74.0060);
    
    expect(result.isEnabled).toBe(true);
    expect(result.enabledCities).toBeInstanceOf(Array);
    expect(result.enabledCities.length).toBeGreaterThan(0);
  });

  it("should return true for coordinates within London", () => {
    // London coordinates: 51.5074, -0.1278
    const result = checkCityEnabled(51.5074, -0.1278);
    
    expect(result.isEnabled).toBe(true);
    expect(result.enabledCities).toBeInstanceOf(Array);
  });

  it("should return true for coordinates within New Delhi", () => {
    // New Delhi coordinates: 28.6139, 77.2090
    const result = checkCityEnabled(28.6139, 77.2090);
    
    expect(result.isEnabled).toBe(true);
    expect(result.enabledCities).toBeInstanceOf(Array);
  });

  it("should return true for coordinates within Mumbai", () => {
    // Mumbai coordinates: 19.0760, 72.8777
    const result = checkCityEnabled(19.0760, 72.8777);
    
    expect(result.isEnabled).toBe(true);
    expect(result.enabledCities).toBeInstanceOf(Array);
  });

  it("should return true for coordinates within Toronto", () => {
    // Toronto coordinates: 43.6532, -79.3832
    const result = checkCityEnabled(43.6532, -79.3832);
    
    expect(result.isEnabled).toBe(true);
    expect(result.enabledCities).toBeInstanceOf(Array);
  });

  it("should return true for coordinates within Barcelona", () => {
    // Barcelona coordinates: 41.3851, 2.1734
    const result = checkCityEnabled(41.3851, 2.1734);
    
    expect(result.isEnabled).toBe(true);
    expect(result.enabledCities).toBeInstanceOf(Array);
  });

  it("should return false for coordinates outside all enabled cities", () => {
    // Middle of ocean coordinates: 0, 0
    const result = checkCityEnabled(0, 0);
    
    expect(result.isEnabled).toBe(false);
    expect(result.enabledCities).toBeInstanceOf(Array);
    expect(result.enabledCities.length).toBeGreaterThan(0);
  });

  it("should return false for coordinates in Antarctica", () => {
    // Antarctica coordinates: -90, 0
    const result = checkCityEnabled(-90, 0);
    
    expect(result.isEnabled).toBe(false);
    expect(result.enabledCities).toBeInstanceOf(Array);
  });

  it("should return all enabled cities list", () => {
    const cities = getEnabledCities();
    
    expect(cities).toBeInstanceOf(Array);
    expect(cities.length).toBeGreaterThan(0);
    
    // Check that expected cities are in the list
    const cityNames = cities.map(c => c.city);
    expect(cityNames).toContain("New York");
    expect(cityNames).toContain("London");
    expect(cityNames).toContain("Paris");
    expect(cityNames).toContain("New Delhi");
    expect(cityNames).toContain("Tokyo");
    expect(cityNames).toContain("Mumbai");
    expect(cityNames).toContain("Bengaluru");
    expect(cityNames).toContain("San Francisco");
    expect(cityNames).toContain("Toronto");
    expect(cityNames).toContain("Montreal");
    expect(cityNames).toContain("Frankfurt");
    expect(cityNames).toContain("Barcelona");
  });

  it("should have proper structure for enabled cities", () => {
    const cities = getEnabledCities();
    
    cities.forEach(city => {
      expect(city).toHaveProperty("city");
      expect(city).toHaveProperty("country");
      expect(typeof city.city).toBe("string");
      expect(typeof city.country).toBe("string");
    });
  });
});