import { config } from "../config";
import ngeohash from "ngeohash";
import { AddressType, Client, GeocodeResult } from "@googlemaps/google-maps-services-js"
import { t, Static } from "elysia";

const client = new Client({});

export const ReverseGeocodeRequestSchema = t.Object({
  lat: t.String(),
  lng: t.String(),
});

export type ReverseGeocodeRequest = Static<typeof ReverseGeocodeRequestSchema>;

export const ReverseGeocodeResponseSchema = t.Object({
  geohash: t.String(),
  country: t.String(),
  city: t.String(),
  locality: t.Optional(t.String()),
  sublocality: t.Optional(t.String()),
  neighborhood: t.Optional(t.String()),
  street: t.Optional(t.String()),
});

export type ReverseGeocodeResponse = Static<typeof ReverseGeocodeResponseSchema>;

async function reverseGeocode(request: ReverseGeocodeRequest): Promise<ReverseGeocodeResponse> {
  const { lat, lng } = request;
  const geohash = ngeohash.encode(lat, lng, 6);

  const response = await client.reverseGeocode({
    params: {
      key: config.keys.googlemaps,
      latlng: `${lat},${lng}`,
      result_type: [
        AddressType.country,
        AddressType.administrative_area_level_1, // state
        AddressType.locality, // city
        AddressType.sublocality, // locality
        AddressType.neighborhood, // neighborhood
        AddressType.route, // street
      ],
    }
  });

  const results = response.data.results;

  const country = findAddressComponent(AddressType.country, results);
  const city = findAddressComponent(AddressType.locality, results);
  const locality = findAddressComponent(AddressType.sublocality, results);
  const neighborhood = findAddressComponent(AddressType.neighborhood, results);
  const street = findAddressComponent(AddressType.route, results);

  return ({
    geohash,
    country,
    city,
    locality,
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