import { ArticleStatus, Prisma } from "../generated/prisma/client.js";

import { prisma } from "../config/prisma.js";

import { mapPrismaError } from "../errors/error-mapper.js";

export class ArticleRepository {
  async findMany(where: Prisma.ArticleWhereInput, skip: number, take: number) {
    const [articles, total] = await prisma.$transaction([
      prisma.article.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take,
      }),
      prisma.article.count({ where }),
    ]);

    return { articles, total };
  }

  async findById(id: string) {
    return prisma.article.findFirst({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async findPublishedBySlug(slug: string) {
    return prisma.article.findFirst({
      where: {
        slug,
        status: ArticleStatus.PUBLISHED,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.ArticleCreateInput) {
    try {
      return await prisma.article.create({
        data,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async update(id: string, data: Prisma.ArticleUpdateInput) {
    try {
      return await prisma.article.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async publish(id: string) {
    try {
      return await prisma.article.update({
        where: { id },
        data: {
          status: ArticleStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}

export default new ArticleRepository();
