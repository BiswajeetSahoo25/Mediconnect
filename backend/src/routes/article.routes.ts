import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import articleController from "../controllers/article.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  articleIdSchema,
  articleSlugSchema,
  createArticleSchema,
  listArticlesQuerySchema,
  updateArticleSchema,
} from "../validators/article.validator.js";

const router = Router();

router.get(
  "/",
  validate({ query: listArticlesQuerySchema }),
  articleController.getArticles.bind(articleController),
);

router.post(
  "/",
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate({ body: createArticleSchema }),
  articleController.createArticle.bind(articleController),
);

router.post(
  "/:id/publish",
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate({ params: articleIdSchema }),
  articleController.publishArticle.bind(articleController),
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate({
    params: articleIdSchema,
    body: updateArticleSchema,
  }),
  articleController.updateArticle.bind(articleController),
);

router.get(
  "/:slug",
  validate({ params: articleSlugSchema }),
  articleController.getArticle.bind(articleController),
);

export default router;
