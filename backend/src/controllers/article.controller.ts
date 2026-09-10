import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/http-errors.js";

import articleService from "../services/article.service.js";

import type {
  ArticleIdInput,
  ArticleSlugInput,
  CreateArticleInput,
  ListArticlesQuery,
  UpdateArticleInput,
} from "../validators/article.validator.js";

export class ArticleController {
  async getArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.validated.query as ListArticlesQuery;

      const result = await articleService.getPublishedArticles(query);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.validated.params as ArticleSlugInput;

      const article = await articleService.getPublishedArticleBySlug(slug);

      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.sub) {
        throw new UnauthorizedError();
      }

      const input = req.validated.body as CreateArticleInput;

      const article = await articleService.createArticle(input, req.user.sub);

      return res.status(201).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.sub) {
        throw new UnauthorizedError();
      }

      const { id } = req.validated.params as ArticleIdInput;

      const input = req.validated.body as UpdateArticleInput;

      const article = await articleService.updateArticle(id, input);

      return res.status(200).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  async publishArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validated.params as ArticleIdInput;

      const article = await articleService.publishArticle(id);

      return res.status(200).json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ArticleController();
