import { Router } from "express";

import { UserController } from "../controllers/user.controller.js";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createUserSchema, loginSchema } from "../validators/user.validator.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const userController = new UserController();
const authController = new AuthController();

router.post(
  "/signup",
  validate({
    body: createUserSchema,
  }),
  userController.create.bind(userController),
);

router.post(
  "/login",
  validate({
    body: loginSchema,
  }),
  authController.login.bind(authController),
);

router.post("/refresh", authController.refresh.bind(authController));

router.post("/logout", authController.logout.bind(authController));

router.get("/me", requireAuth, authController.me.bind(authController));


export default router;
