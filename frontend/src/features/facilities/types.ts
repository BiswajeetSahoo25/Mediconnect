export type NearbyFacilityType = "HOSPITAL" | "CLINIC";

export interface NearbyFacility {
  name: string;
  type: NearbyFacilityType;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  distance: number;
  phone?: string;
  email?: string;
  website?: string;
  placeId: string;
}

export interface FacilityDetails {
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  openingHours?: string;
  categories?: string[];
  wheelchairAccessible?: boolean;
  toiletsAvailable?: boolean;
  placeId: string;
}