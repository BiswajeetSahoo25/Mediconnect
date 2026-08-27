import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createUserSchema,
  userIdSchema,
} from "../validators/user.validator.js";

const router = Router();
const userController = new UserController();

router.get(
  "/:id",
  validate({
    params: userIdSchema,
  }),
  userController.getById.bind(userController),
);

router.post(
  "/",
  validate({
    body: createUserSchema,
  }),
  userController.create.bind(userController),
);

export default router;
