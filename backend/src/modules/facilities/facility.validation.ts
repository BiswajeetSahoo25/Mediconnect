import { z } from "zod";

export const nearbyFacilitiesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().int().min(100).max(50000).optional(),
});

export type NearbyFacilitiesQuery = z.infer<typeof nearbyFacilitiesQuerySchema>;

export const geocodeLocationQuerySchema = z.object({
  query: z.string().trim().min(2).max(200),
});

export type GeocodeLocationQuery = z.infer<typeof geocodeLocationQuerySchema>;

export const facilityDetailsParamsSchema = z.object({
  placeId: z.string().trim().min(1),
});

export type FacilityDetailsParams = z.infer<typeof facilityDetailsParamsSchema>;
