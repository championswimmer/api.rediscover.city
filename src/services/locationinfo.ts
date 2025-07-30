import { Static, t } from "elysia";
import { config } from "../config";
import { createPerplexity } from "@ai-sdk/perplexity";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LanguageModelV2, SharedV2ProviderOptions } from "@ai-sdk/provider";
import { generateObject, jsonSchema } from "ai";
import { ReverseGeocodeResponse } from "./geocoding";
import { toJSONSchema } from "@typeschema/typebox";
import ngeohash from "ngeohash";
import { locationInfoPrompt } from "../prompts/location-info";
import adze from "adze";

export const LocationInfoRequestSchema = t.Object({
  geohash: t.Optional(t.String()),
  lat: t.Optional(t.String()),
  lng: t.Optional(t.String()),
});

export type LocationInfoRequest = Static<typeof LocationInfoRequestSchema>;

const perplexity = createPerplexity({
  apiKey: config.keys.perplexity,
});

const google = createGoogleGenerativeAI({
  apiKey: config.keys.googleai,
});

const models = {
  perplexity: {
    sonar: perplexity("sonar"),
    sonar_pro: perplexity("sonar-pro"),
  },
  google: {
    gemini_2_5_flash: google("gemini-2.5-flash"),
    gemini_2_5_pro: google("gemini-2.5-pro"),
    gemini_2_5_flash_lite: google("gemini-2.5-flash-lite"),
  }
}

const getModel = (): LanguageModelV2 => {
  switch (config.aiModel) {
    case "perplexity/sonar-pro":
      return models.perplexity.sonar_pro;
    case "perplexity/sonar":
      return models.perplexity.sonar;
    case "google/gemini-2.5-pro":
      return models.google.gemini_2_5_pro;
    case "google/gemini-2.5-flash":
      return models.google.gemini_2_5_flash;
    case "google/gemini-2.5-flash-lite":
      return models.google.gemini_2_5_flash_lite;
    default:
      throw new Error(`Unknown model: ${config.aiModel}`);
  }
}

const getProviderOptions = (): SharedV2ProviderOptions => ({
  "perplexity": {},
  "google": {
    "useSearchGrounding": true,
  }
})

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
  adze.info("Getting location info", { latitude, longitude, geohash: location.geohash, model: config.aiModel });
  const response = await generateObject({
    model: getModel(),
    providerOptions: getProviderOptions(),
    schema: jsonSchema<LocationInfoResponse>(await toJSONSchema(LocationInfoResponseSchema)),
    prompt: locationInfoPrompt({
      ...location,
      latitude,
      longitude,
    }),
  })

  return response.object;
}