import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  updateCurrentUserSchema,
  userIdSchema,
} from "../validators/user.validator.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
const userController = new UserController();

router.get(
  "/me",
  requireAuth,
  userController.getCurrentUser.bind(userController),
);

router.patch(
  "/me",
  requireAuth,
  validate({ body: updateCurrentUserSchema }),
  userController.updateCurrentUser.bind(userController),
);

router.post(
  "/me/onboarding/complete",
  requireAuth,
  userController.completeOnboarding.bind(userController),
);

router.get(
  "/:id",
  requireAuth,
  validate({
    params: userIdSchema,
  }),
  userController.getById.bind(userController),
);

export default router;
