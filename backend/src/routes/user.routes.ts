import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { userIdSchema } from "../validators/user.validator.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
const userController = new UserController();

router.get(
  "/:id",
  requireAuth,
  validate({
    params: userIdSchema,
  }),
  userController.getById.bind(userController),
);

export default router;
