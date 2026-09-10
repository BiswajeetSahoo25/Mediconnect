import { api } from "./api";

export interface UserLocation {
  latitude: number;
  longitude: number;
  formatted: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  formatted: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface GeocodeLocationResponse {
  status: "success";
  data: GeocodedLocation;
}

export async function getCurrentLocation(): Promise<UserLocation> {
  const coordinates = await new Promise<{
    latitude: number;
    longitude: number;
  }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission was denied"));
            break;

          case error.POSITION_UNAVAILABLE:
            reject(new Error("Unable to determine your location"));
            break;

          case error.TIMEOUT:
            reject(new Error("Location request timed out"));
            break;

          default:
            reject(new Error("Unable to get your location"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  });

  try {
    const response = await api.get<GeocodeLocationResponse>(
      "/facilities/location/reverse",
      {
        params: {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        },
      },
    );

    const location = response.data.data;

    return {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      formatted: location.formatted,
      city: location.city,
      state: location.state,
      country: location.country,
      postcode: location.postcode,
    };
  } catch {
    return {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      formatted: "",
    };
  }
}

export async function geocodeLocation(
  query: string,
): Promise<GeocodedLocation> {
  const response = await api.get<GeocodeLocationResponse>(
    "/facilities/location",
    {
      params: {
        query,
      },
    },
  );

  return response.data.data;
}
