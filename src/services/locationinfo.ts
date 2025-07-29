import { Static, t } from "elysia";
import { config } from "../config";
import { createPerplexity } from "@ai-sdk/perplexity";
import { generateObject, jsonSchema } from "ai";
import { ReverseGeocodeResponse } from "./geocoding";
import { toJSONSchema } from "@typeschema/typebox";
import ngeohash from "ngeohash";
import { locationInfoPrompt } from "../prompts/location-info";

export const LocationInfoRequestSchema = t.Object({
  geohash: t.String(),
});

export type LocationInfoRequest = Static<typeof LocationInfoRequestSchema>;

const perplexity = createPerplexity({
  apiKey: config.keys.perplexity,
});

export const LocationInfoResponseSchema = t.Object({
  name: t.String({ description: "The name of the location" }),
  description: t.String({ description: "A short description of the location" }),
  history: t.String({ description: "Historical facts about the location" }),
  culture: t.String({ description: "Cultural aspects and traditions" }),
  attractions: t.Array(t.Object({
    name: t.String({ description: "The name of the attraction" }),
    distance: t.String({ description: "The distance to the attraction" }),
    whyVisit: t.String({ description: "Why this attraction is worth visiting" })
  })),
  climate: t.String({ description: "Climate throughout the year in this area" }),
  demographics: t.String({ description: "Demographics of the location" }),
  economy: t.String({ description: "Economic aspects of the location" }),
});

export type LocationInfoResponse = Static<typeof LocationInfoResponseSchema>;

export async function getLocationInfo(location: ReverseGeocodeResponse): Promise<LocationInfoResponse> {
  const { latitude, longitude } = ngeohash.decode(location.geohash);
  const response = await generateObject({
    model: perplexity("sonar-pro"),
    schema: jsonSchema<LocationInfoResponse>(await toJSONSchema(LocationInfoResponseSchema)),
    prompt: locationInfoPrompt({
      ...location,
      latitude,
      longitude,
    }),
  })

  return response.object;
}