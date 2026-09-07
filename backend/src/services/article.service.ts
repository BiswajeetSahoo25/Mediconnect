import { ArticleStatus, Prisma } from "../generated/prisma/client.js";

import articleRepository from "../repositories/article.repository.js";

import type { ArticleDetail, ArticlePreview } from "../types/article.js";

import type {
  CreateArticleInput,
  ListArticlesQuery,
  UpdateArticleInput,
} from "../validators/article.validator.js";

import { ConflictError, NotFoundError } from "../errors/http-errors.js";

export class ArticleService {
  async getPublishedArticles(query: ListArticlesQuery) {
    const { page, limit, category, search } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.PUBLISHED,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          summary: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const { articles, total } = await articleRepository.findMany(
      where,
      skip,
      limit,
    );

    const data: ArticlePreview[] = articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.summary,
      imageUrl: article.thumbnailUrl ?? article.imageUrl ?? undefined,
      category: article.category,
      source: "Medico",
      publishedAt: article.publishedAt?.toISOString() ?? "",
      type: "MEDICO",
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPublishedArticleBySlug(slug: string): Promise<ArticleDetail | null> {
    const article = await articleRepository.findPublishedBySlug(slug);

    if (!article) {
      return null;
    }

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.summary,
      content: article.content,
      imageUrl: article.imageUrl ?? undefined,
      category: article.category,
      source: "Medico",
      publishedAt: article.publishedAt?.toISOString() ?? "",
      type: "MEDICO",
      author: {
        id: article.author.id,
        name: article.author.email,
      },
    };
  }

  async createArticle(input: CreateArticleInput, authorId: string) {
    const articleData: Prisma.ArticleCreateInput = {
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      content: input.content,
      category: input.category,
      imageUrl: input.imageUrl,
      thumbnailUrl: input.thumbnailUrl,
      seoDescription: input.seoDescription,

      status: ArticleStatus.DRAFT,
      publishedAt: null,

      author: {
        connect: {
          id: authorId,
        },
      },
    };

    return articleRepository.create(articleData);
  }

  async updateArticle(id: string, input: UpdateArticleInput) {
    const articleData: Prisma.ArticleUpdateInput = {
      ...input,
    };

    return articleRepository.update(id, articleData);
  }

  async publishArticle(id: string) {
    const article = await articleRepository.findById(id);

    if (!article) {
      throw new NotFoundError("Article not found");
    }

    if (article.status === ArticleStatus.PUBLISHED) {
      throw new ConflictError("Article is already published");
    }

    if (article.status === ArticleStatus.ARCHIVED) {
      throw new ConflictError("Archived article cannot be published");
    }

    return articleRepository.publish(id);
  }
}

export default new ArticleService();
