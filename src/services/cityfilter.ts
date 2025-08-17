import { t, Static } from "elysia";
import enabledCitiesData from "../data/enabled-cities.json";

export interface EnabledCity {
  city: string;
  country: string;
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
}

export interface CityFilterResult {
  isEnabled: boolean;
  enabledCities: Array<{ city: string; country: string }>;
}

export const CityFilterRequestSchema = t.Object({
  lat: t.Number({ examples: [40.7128, 51.5074] }),
  lng: t.Number({ examples: [-74.0060, -0.1278] })
});

export type CityFilterRequest = Static<typeof CityFilterRequestSchema>;

/**
 * Checks if the given latitude and longitude coordinates fall within 
 * any of the enabled city bounding boxes.
 */
export function checkCityEnabled(lat: number, lng: number): CityFilterResult {
  const enabledCities = enabledCitiesData as EnabledCity[];
  
  // Check if coordinates fall within any enabled city's bounding box
  const isEnabled = enabledCities.some(city => 
    lat >= city.minLat && 
    lat <= city.maxLat && 
    lng >= city.minLon && 
    lng <= city.maxLon
  );

  // Return list of enabled cities for error messaging
  const enabledCityList = enabledCities.map(city => ({
    city: city.city,
    country: city.country
  }));

  return {
    isEnabled,
    enabledCities: enabledCityList
  };
}

/**
 * Gets the list of all enabled cities
 */
export function getEnabledCities(): Array<{ city: string; country: string }> {
  const enabledCities = enabledCitiesData as EnabledCity[];
  return enabledCities.map(city => ({
    city: city.city,
    country: city.country
  }));
}