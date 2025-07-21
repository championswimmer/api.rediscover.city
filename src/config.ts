export const config = {
  port: process.env.PORT || 3000,
  keys: {
    perplexity: process.env.PERPLEXITY_API_KEY!,
    googlemaps: process.env.GOOGLE_MAPS_API_KEY!,
  },
};
