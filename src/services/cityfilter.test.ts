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

  it("should return true for coordinates within Sydney", () => {
    // Sydney coordinates: -33.8688, 151.2093
    const result = checkCityEnabled(-33.8688, 151.2093);
    
    expect(result.isEnabled).toBe(true);
    expect(result.enabledCities).toBeInstanceOf(Array);
  });

  it("should return true for coordinates within Dubai", () => {
    // Dubai coordinates: 25.2048, 55.2708
    const result = checkCityEnabled(25.2048, 55.2708);
    
    expect(result.isEnabled).toBe(true);
    expect(result.enabledCities).toBeInstanceOf(Array);
  });

  it("should return true for coordinates within Bangkok", () => {
    // Bangkok coordinates: 13.7563, 100.5018
    const result = checkCityEnabled(13.7563, 100.5018);
    
    expect(result.isEnabled).toBe(true);
    expect(result.enabledCities).toBeInstanceOf(Array);
  });

  it("should return true for coordinates within Moscow", () => {
    // Moscow coordinates: 55.7558, 37.6176
    const result = checkCityEnabled(55.7558, 37.6176);
    
    expect(result.isEnabled).toBe(true);
    expect(result.enabledCities).toBeInstanceOf(Array);
  });

  it("should return true for coordinates within Beijing", () => {
    // Beijing coordinates: 39.9042, 116.4074
    const result = checkCityEnabled(39.9042, 116.4074);
    
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
    // Check some of the newly added cities
    expect(cityNames).toContain("Beijing");
    expect(cityNames).toContain("Sydney");
    expect(cityNames).toContain("Dubai");
    expect(cityNames).toContain("Bangkok");
    expect(cityNames).toContain("Moscow");
    expect(cityNames).toContain("Seoul");
    expect(cityNames).toContain("Singapore");
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