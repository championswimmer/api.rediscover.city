import { Elysia, t } from "elysia";

/**
 * route mounted at /v1/locate
 */
const route = new Elysia({ prefix: "/v1/locate" })
  .get("/", ({ query }) => {
    const { lat, lng } = query;
    console.log(lat, lng);

    // Mock response data (to be replaced with actual Google Maps API call later)
    return {
      country: "United States",
      city: "San Francisco",
      locality: "Mission District",
      sublocality: "Mission Dolores",
      geohash: "9q8yy"
    };
  }, {
    query: t.Object({
      lat: t.String({ description: "Latitude" }),
      lng: t.String({ description: "Longitude" })
    })
  });

export default route;