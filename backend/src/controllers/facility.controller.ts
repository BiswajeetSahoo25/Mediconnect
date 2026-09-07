import type { Request, Response } from "express";
import {
  geocodeLocation,
  getFacilityDetails,
  getNearbyFacilities,
  reverseGeocodeLocation,
} from "../services/facility.service.js";

import type {
  FacilityDetailsParams,
  GeocodeLocationQuery,
  NearbyFacilitiesQuery,
} from "../validators/facility.validator.js";

export async function getNearbyFacilitiesController(
  req: Request,
  res: Response,
) {
  const query = req.validated.query as NearbyFacilitiesQuery;

  const facilities = await getNearbyFacilities(
    query.lat,
    query.lng,
    query.radius,
  );

  res.status(200).json({
    status: "success",
    data: facilities,
  });
}

export async function geocodeLocationController(req: Request, res: Response) {
  const query = req.validated.query as GeocodeLocationQuery;

  const location = await geocodeLocation(query.query);

  if (!location) {
    res.status(404).json({
      status: "error",
      message: "Location not found",
    });
    return;
  }

  res.status(200).json({
    status: "success",
    data: location,
  });
}
export async function getFacilityDetailsController(
  req: Request,
  res: Response,
) {
  const params = req.validated.params as FacilityDetailsParams;

  const facility = await getFacilityDetails(params.placeId);

  if (!facility) {
    res.status(404).json({
      status: "error",
      message: "Healthcare facility not found",
    });
    return;
  }

  res.status(200).json({
    status: "success",
    data: facility,
  });
}

export async function reverseGeocodeLocationController(
  req: Request,
  res: Response,
) {
  const query = req.validated.query as NearbyFacilitiesQuery;

  const location = await reverseGeocodeLocation(query.lat, query.lng);

  if (!location) {
    res.status(404).json({
      status: "error",
      message: "Location not found",
    });
    return;
  }

  res.status(200).json({
    status: "success",
    data: location,
  });
}
