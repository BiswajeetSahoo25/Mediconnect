import { Router } from "express";

import { UserAddressController } from "../controllers/user-address.controller.js";

import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";

import {
  createUserAddressSchema,
  updateUserAddressSchema,
  userAddressIdSchema,
} from "../validators/user-address.validator.js";

const router = Router();

const userAddressController = new UserAddressController();

router.get(
  "/",
  requireAuth,
  userAddressController.getAddresses.bind(userAddressController),
);

router.post(
  "/",
  requireAuth,
  validate({ body: createUserAddressSchema }),
  userAddressController.createAddress.bind(userAddressController),
);

router.patch(
  "/:id",
  requireAuth,
  validate({
    params: userAddressIdSchema,
    body: updateUserAddressSchema,
  }),
  userAddressController.updateAddress.bind(userAddressController),
);

router.delete(
  "/:id",
  requireAuth,
  validate({
    params: userAddressIdSchema,
  }),
  userAddressController.deleteAddress.bind(userAddressController),
);

export default router;
