import { Router } from "express";
import {
  geocodeLocationController,
  getFacilityDetailsController,
  getNearbyFacilitiesController,
  reverseGeocodeLocationController,
} from "./facility.controller.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  facilityDetailsParamsSchema,
  geocodeLocationQuerySchema,
  nearbyFacilitiesQuerySchema,
} from "./facility.validation.js";

const facilityRouter = Router();

facilityRouter.get(
  "/location/reverse",
  validate({
    query: nearbyFacilitiesQuerySchema,
  }),
  reverseGeocodeLocationController,
);
facilityRouter.get(
  "/nearby",
  validate({
    query: nearbyFacilitiesQuerySchema,
  }),
  getNearbyFacilitiesController,
);

facilityRouter.get(
  "/location",
  validate({
    query: geocodeLocationQuerySchema,
  }),
  geocodeLocationController,
);

facilityRouter.get(
  "/:placeId",
  validate({
    params: facilityDetailsParamsSchema,
  }),
  getFacilityDetailsController,
);

export default facilityRouter;
