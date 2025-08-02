import { config } from "../config";
import ngeohash from "ngeohash";
import { AddressType, Client, GeocodeResult } from "@googlemaps/google-maps-services-js"
import { t, Static } from "elysia";

const client = new Client({});

export const ReverseGeocodeRequestSchema = t.Object({
  lat: t.String({ examples: ["40.7128", "51.5074"] }), // NYC, London
  lng: t.String({ examples: ["-74.0060", "-0.1278"] }), // NYC, London
});

export type ReverseGeocodeRequest = Static<typeof ReverseGeocodeRequestSchema>;

export const ReverseGeocodeResponseSchema = t.Object({
  geohash: t.String({ examples: ["dr5reg", "gcpuv"] }),
  country: t.String({ examples: ["United States", "United Kingdom"] }),
  city: t.String({ examples: ["New York", "London"] }),
  locality: t.Optional(t.String({ examples: ["Manhattan", "Central London"] })),
  sublocality: t.Optional(t.String({ examples: ["Upper West Side", "Chelsea"] })),
  neighborhood: t.Optional(t.String({ examples: ["Astoria", "Notting Hill"] })),
  street: t.Optional(t.String({ examples: ["Crescent Street", "Varna Road"] })),
});

export type ReverseGeocodeResponse = Static<typeof ReverseGeocodeResponseSchema>;

async function reverseGeocode(request: ReverseGeocodeRequest): Promise<ReverseGeocodeResponse> {
  const { lat, lng } = request;
  const geohash = ngeohash.encode(lat, lng, config.geohashPrecision);

  const response = await client.reverseGeocode({
    params: {
      key: config.keys.googlemaps,
      latlng: `${lat},${lng}`,
      result_type: [
        AddressType.country,
        AddressType.administrative_area_level_1, // state
        AddressType.locality, // city
        AddressType.sublocality, // locality
        AddressType.sublocality_level_1, // sublocality
        AddressType.neighborhood, // neighborhood
        AddressType.route, // street
      ],
    }
  });

  const results = response.data.results;

  const country = findAddressComponent(AddressType.country, results);
  const city = findAddressComponent(AddressType.locality, results);
  const locality = findAddressComponent(AddressType.sublocality, results);
  const sublocality = findAddressComponent(AddressType.sublocality_level_1, results);
  const neighborhood = findAddressComponent(AddressType.neighborhood, results);
  const street = findAddressComponent(AddressType.route, results);

  return ({
    geohash,
    country,
    city,
    locality,
    sublocality,
    neighborhood,
    street,
  })
}

function findAddressComponent(addressType: AddressType, results: GeocodeResult[]): string {

  const result = results.find(result =>
    result.address_components.some(component => component.types.includes(addressType))
  );

  if (!result) {
    return "";
  }

  return result.address_components.find(component => component.types.includes(addressType))?.long_name ?? "";
}

export { reverseGeocode };