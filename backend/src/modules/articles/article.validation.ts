import { z } from "zod";

export const articleIdSchema = z.object({
  id: z.string().uuid(),
});

export const articleSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(300)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),
});

export const listArticlesQuerySchema = z.object({
  category: z.string().trim().min(1).max(100).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const createArticleSchema = z.object({
  title: z.string().trim().min(5).max(300),

  slug: z
    .string()
    .trim()
    .min(3)
    .max(300)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),

  summary: z.string().trim().min(10),
  content: z.string().trim().min(20),
  category: z.string().trim().min(1).max(100),
  imageUrl: z.string().trim().url().optional(),
  thumbnailUrl: z.string().trim().url().optional(),
  seoDescription: z.string().trim().max(320).optional(),
});

export const updateArticleSchema = z
  .object({
    title: z.string().trim().min(5).max(300).optional(),

    slug: z
      .string()
      .trim()
      .min(3)
      .max(300)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers and hyphens",
      )
      .optional(),

    summary: z.string().trim().min(10).optional(),
    content: z.string().trim().min(20).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    imageUrl: z.string().trim().url().optional(),
    thumbnailUrl: z.string().trim().url().optional(),
    seoDescription: z.string().trim().max(320).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type ArticleIdInput = z.infer<typeof articleIdSchema>;

export type ArticleSlugInput = z.infer<typeof articleSlugSchema>;

export type ListArticlesQuery = z.infer<typeof listArticlesQuerySchema>;

export type CreateArticleInput = z.infer<typeof createArticleSchema>;

export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
