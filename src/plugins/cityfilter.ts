import { Elysia, t } from "elysia";
import { GeocodingController } from "../controllers/geocoding.controller";
import { getEnabledCities } from "../services/cityfilter";
import adze from "adze";

/**
 * Elysia plugin that validates latitude/longitude coordinates against enabled cities.
 * Returns an error response if coordinates are not within any enabled city boundaries.
 */
export const cityFilterPlugin = () => {
  return new Elysia({ name: "cityFilter" })
    .onBeforeHandle(({ query, set, geoCtrl }) => {
      // Only validate if both lat and lng are present in query
      if (query && 'lat' in query && 'lng' in query) {
        const lat = parseFloat(query.lat as string);
        const lng = parseFloat(query.lng as string);
        
        // Check if coordinates are valid numbers
        if (isNaN(lat) || isNaN(lng)) {
          return; // Let the route handler deal with invalid coordinates
        }
        
        adze.info("Checking city filter for coordinates", { lat, lng });
        
        const validationResult = geoCtrl.validateCoordinatesEnabled(lat, lng);
        
        if (!validationResult.isEnabled) {
          adze.warn("Coordinates not in enabled city", { lat, lng });
          set.status = 403;
          return {
            error: "Service not available",
            message: `The requested coordinates (${lat}, ${lng}) are not within our service area. We currently provide services for the following cities:`,
            availableCities: validationResult.enabledCities,
            code: "COORDINATES_NOT_ENABLED"
          };
        }
        
        adze.info("Coordinates validated successfully", { lat, lng });
      }
    });
};