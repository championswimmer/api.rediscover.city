import { Static, t } from "elysia";

export const LocationInfoRequestSchema = t.Object({
  geohash: t.String(),
});

export type LocationInfoRequest = Static<typeof LocationInfoRequestSchema>;