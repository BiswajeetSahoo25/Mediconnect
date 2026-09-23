import { api } from "../../../services/api";
import type { FacilityDetails, NearbyFacility } from "../types";

export interface NearbyFacilitiesResponse {
  status: "success";
  data: NearbyFacility[];
}
export interface FacilityDetailsResponse {
  status: "success";
  data: FacilityDetails;
}

export async function getNearbyFacilities(
  latitude: number,
  longitude: number,
  radius = 5000,
): Promise<NearbyFacilitiesResponse> {
  const response = await api.get<NearbyFacilitiesResponse>(
    "/facilities/nearby",
    {
      params: {
        lat: latitude,
        lng: longitude,
        radius,
      },
    },
  );

  return response.data;
}

export async function getFacilityDetails(
  placeId: string,
): Promise<FacilityDetailsResponse> {
  const response = await api.get<FacilityDetailsResponse>(
    `/facilities/${encodeURIComponent(placeId)}`,
  );

  return response.data;
}
