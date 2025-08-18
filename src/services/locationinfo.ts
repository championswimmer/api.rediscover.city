import { Static, t } from "elysia";
import { config } from "../../config";
import { createPerplexity } from "@ai-sdk/perplexity";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LanguageModelV2, SharedV2ProviderOptions } from "@ai-sdk/provider";
import { generateObject, generateText, jsonSchema, Output, streamText } from "ai";
import { ReverseGeocodeResponse } from "./geocoding";
import { toJSONSchema } from "@typeschema/typebox";
import ngeohash from "ngeohash";
import { locationInfoPrompt } from "../prompts/location-info";
import adze from "adze";
import { createOpenAI } from "@ai-sdk/openai";

export const LocationInfoRequestSchema = t.Object({
  geohash: t.Optional(t.String({ examples: ["dr5regw", "gcpuv7d"] })),
  lat: t.Optional(t.String({ examples: ["40.7128", "51.5074"] })), // NYC, London
  lng: t.Optional(t.String({ examples: ["-74.0060", "-0.1278"] })), // NYC, London
  refresh: t.Optional(t.Boolean({ default: false, examples: [true, false] })),
});

export type LocationInfoRequest = Static<typeof LocationInfoRequestSchema>;

const perplexity = createPerplexity({
  apiKey: config.keys.perplexity,
});

const google = createGoogleGenerativeAI({
  apiKey: config.keys.googleai,
});

const openai = createOpenAI({
  apiKey: config.keys.openai,
})

const models = {
  perplexity: {
    sonar: perplexity("sonar"),
    sonar_pro: perplexity("sonar-pro"),
  },
  google: {
    gemini_2_5_flash: google("gemini-2.5-flash"),
    gemini_2_5_pro: google("gemini-2.5-pro"),
    gemini_2_5_flash_lite: google("gemini-2.5-flash-lite"),
  },
  openai: {
    gpt_5: openai.responses("gpt-5"),
    gpt_5_mini: openai.responses("gpt-5-mini"),
    gpt_5_nano: openai.responses("gpt-5-nano"),
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
    case "openai/gpt-5":
      return models.openai.gpt_5;
    case "openai/gpt-5-mini":
      return models.openai.gpt_5_mini;
    case "openai/gpt-5-nano":
      return models.openai.gpt_5_nano;
    default:
      throw new Error(`Unknown model: ${config.aiModel}`);
  }
}

// TODO: re-enable search grounding for PRO users
const getProviderOptions = (): SharedV2ProviderOptions => ({
  "perplexity": {
    "web_search_options": {
      "search_context_size": "medium"
    }
  },
  "google": {
    "useSearchGrounding": true,
  },
  "openai": {
    "reasoningEffort": "minimal"
  }
})

export const LocationInfoResponseSchema = t.Object({
  name: t.String({ description: "The name of the location", examples: ["Paris", "Tokyo", "New York City"] }),
  description: t.String({ description: "A short description of the location", examples: ["A vibrant city known for its art and culture...", "A bustling metropolis with a rich history..."] }),
  history: t.String({ description: "Historical facts about the location", examples: ["Founded in the 3rd century BC...", "Home to the Eiffel Tower since 1889..."] }),
  culture: t.String({ description: "Cultural aspects and traditions", examples: ["Known for its world-class museums and art galleries...", "Famous for its street food and night markets..."] }),
  attractions: t.Array(t.Object({
    name: t.String({ description: "The name of the attraction", examples: ["Eiffel Tower", "Louvre Museum"] }),
    distance: t.String({ description: "The distance to the attraction", examples: ["2.5 km from city center", "500 meters from the hotel"] }),
    whyVisit: t.String({ description: "Why this attraction is worth visiting", examples: ["Iconic landmark with stunning city views...", "Home to the world's most famous art collections..."] })
  })),
  climate: t.String({ description: "Climate throughout the year in this area", examples: ["Mediterranean climate with hot, dry summers...", "Temperate climate with four distinct seasons..."] }),
  demographics: t.String({ description: "Demographics of the location", examples: ["Population of 2.1 million people...", "Diverse multicultural community..."] }),
  economy: t.String({ description: "Economic aspects of the location", examples: ["Major financial hub in Europe...", "Thriving tech industry and startup ecosystem..."] }),
});

export type LocationInfoResponse = Static<typeof LocationInfoResponseSchema>;

export async function getLocationInfo(location: ReverseGeocodeResponse): Promise<LocationInfoResponse> {
  const { latitude, longitude } = ngeohash.decode(location.geohash);
  adze.info("Getting location info", { latitude, longitude, geohash: location.geohash, model: config.aiModel });
  const response = await generateObject({
    model: getModel(),
    providerOptions: getProviderOptions(), // TODO: re-enable search grounding for PRO users
    schema: jsonSchema<LocationInfoResponse>(await toJSONSchema(LocationInfoResponseSchema)),
    prompt: locationInfoPrompt({
      ...location,
      latitude,
      longitude,
    }),
  })

  adze.info("response metadata", JSON.stringify(response.providerMetadata, null, 2));

  return response.object;
}