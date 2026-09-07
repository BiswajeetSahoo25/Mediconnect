import { env } from "../config/env.js";
import type {
  NearbyFacility,
  NearbyFacilityType,
  FacilityDetails,
} from "../types/facility.js";

const GEOAPIFY_PLACES_URL = "https://api.geoapify.com/v2/places";
const GEOAPIFY_GEOCODING_URL = "https://api.geoapify.com/v1/geocode/search";
const GEOAPIFY_PLACE_DETAILS_URL = "https://api.geoapify.com/v2/place-details";

type GeoapifyProperties = {
  name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  lat?: number;
  lon?: number;
  categories?: string[];
  distance?: number;
  place_id?: string;
  website?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
};

type GeoapifyFeature = {
  properties?: GeoapifyProperties;
};

type GeoapifyResponse = {
  features?: GeoapifyFeature[];
};

type GeoapifyGeocodingProperties = {
  lat?: number;
  lon?: number;
  formatted?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  result_type?: string;
};

type GeoapifyGeocodingFeature = {
  properties?: GeoapifyGeocodingProperties;
};

type GeoapifyGeocodingResponse = {
  features?: GeoapifyGeocodingFeature[];
};
type GeoapifyDetailsProperties = {
  name?: string;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  lat?: number;
  lon?: number;
  place_id?: string;
  website?: string;
  description?: string;
  opening_hours?: string;
  categories?: string[];
  contact?: {
    phone?: string;
    email?: string;
  };
  wheelchair?: boolean;
  toilets?: boolean;
  feature_type?: string;
};

type GeoapifyDetailsFeature = {
  properties?: GeoapifyDetailsProperties;
};

type GeoapifyDetailsResponse = {
  features?: GeoapifyDetailsFeature[];
};

function getFacilityType(categories: string[] = []): NearbyFacilityType | null {
  if (categories.includes("healthcare.hospital")) {
    return "HOSPITAL";
  }

  if (categories.includes("healthcare.clinic")) {
    return "CLINIC";
  }

  return null;
}

function mapGeoapifyFacility(feature: GeoapifyFeature): NearbyFacility | null {
  const properties = feature.properties;

  if (
    !properties?.name ||
    properties.lat === undefined ||
    properties.lon === undefined ||
    !properties.place_id
  ) {
    return null;
  }

  const type = getFacilityType(properties.categories);

  if (!type) {
    return null;
  }

  return {
    name: properties.name,
    type,
    address:
      properties.address_line2 ??
      properties.address_line1 ??
      "Address unavailable",
    city: properties.city,
    state: properties.state,
    country: properties.country,
    pincode: properties.postcode,
    latitude: properties.lat,
    longitude: properties.lon,
    distance: properties.distance ?? 0,
    phone: properties.contact?.phone,
    email: properties.contact?.email,
    website: properties.website,
    placeId: properties.place_id,
  };
}

export async function getNearbyFacilities(
  latitude: number,
  longitude: number,
  radius = 5000,
): Promise<NearbyFacility[]> {
  const params = new URLSearchParams({
    apiKey: env.geoapifyApiKey,
    categories: "healthcare.hospital",
    filter: `circle:${longitude},${latitude},${radius}`,
    bias: `proximity:${longitude},${latitude}`,
    limit: "20",
  });

  const response = await fetch(`${GEOAPIFY_PLACES_URL}?${params.toString()}`);

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("Geoapify API error:", {
      status: response.status,
      body: errorBody,
    });

    throw new Error("Failed to fetch nearby healthcare facilities");
  }

  const data = (await response.json()) as GeoapifyResponse;

  const facilities = data.features ?? [];

  return facilities
    .map(mapGeoapifyFacility)
    .filter((facility): facility is NearbyFacility => facility !== null);
}

export async function geocodeLocation(query: string): Promise<{
  latitude: number;
  longitude: number;
  formatted: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
} | null> {
  const params = new URLSearchParams({
    apiKey: env.geoapifyApiKey,
    text: query,
    type: "city",
    filter: "countrycode:in",
    limit: "1",
  });

  const response = await fetch(
    `${GEOAPIFY_GEOCODING_URL}?${params.toString()}`,
  );

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("Geoapify Geocoding API error:", {
      status: response.status,
      body: errorBody,
    });

    throw new Error("Failed to geocode location");
  }

  const data = (await response.json()) as GeoapifyGeocodingResponse;

  const properties = data.features?.[0]?.properties;

  if (
    !properties ||
    typeof properties.lat !== "number" ||
    typeof properties.lon !== "number" ||
    typeof properties.formatted !== "string" ||
    properties.result_type !== "city"
  ) {
    return null;
  }

  return {
    latitude: properties.lat,
    longitude: properties.lon,
    formatted: properties.formatted,
    city: properties.city,
    state: properties.state,
    country: properties.country,
    postcode: properties.postcode,
  };
}
export async function getFacilityDetails(
  placeId: string,
): Promise<FacilityDetails | null> {
  const params = new URLSearchParams({
    apiKey: env.geoapifyApiKey,
    id: placeId,
  });

  const response = await fetch(
    `${GEOAPIFY_PLACE_DETAILS_URL}?${params.toString()}`,
  );

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("Geoapify Place Details API error:", {
      status: response.status,
      body: errorBody,
    });

    throw new Error("Failed to fetch facility details");
  }

  const data = (await response.json()) as GeoapifyDetailsResponse;

  const feature = data.features?.find(
    (item) => item.properties?.feature_type === "details",
  );

  const properties = feature?.properties;

  if (
    !properties ||
    typeof properties.name !== "string" ||
    typeof properties.lat !== "number" ||
    typeof properties.lon !== "number" ||
    typeof properties.place_id !== "string"
  ) {
    return null;
  }

  return {
    name: properties.name,
    address:
      properties.formatted ??
      properties.address_line2 ??
      properties.address_line1 ??
      "Address unavailable",
    city: properties.city,
    state: properties.state,
    country: properties.country,
    pincode: properties.postcode,
    latitude: properties.lat,
    longitude: properties.lon,
    phone: properties.contact?.phone,
    email: properties.contact?.email,
    website: properties.website,
    description: properties.description,
    openingHours: properties.opening_hours,
    categories: properties.categories,
    wheelchairAccessible: properties.wheelchair,
    toiletsAvailable: properties.toilets,
    placeId: properties.place_id,
  };
}

const GEOAPIFY_REVERSE_GEOCODING_URL =
  "https://api.geoapify.com/v1/geocode/reverse";

export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number,
) {
  const params = new URLSearchParams({
    apiKey: env.geoapifyApiKey,
    lat: latitude.toString(),
    lon: longitude.toString(),
    limit: "1",
  });

  const response = await fetch(
    `${GEOAPIFY_REVERSE_GEOCODING_URL}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to reverse geocode location");
  }

  const data = (await response.json()) as GeoapifyGeocodingResponse;
  const properties = data.features?.[0]?.properties;

  if (!properties) {
    return null;
  }

  return {
    latitude,
    longitude,
    formatted: properties.formatted,
    city: properties.city,
    state: properties.state,
    country: properties.country,
    postcode: properties.postcode,
  };
}
