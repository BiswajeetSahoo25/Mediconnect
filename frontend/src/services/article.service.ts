import { api } from "./api";
import type { ArticleDetail, ArticleListResponse } from "../types/article";

export async function getArticles(params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await api.get<ArticleListResponse>("/articles", {
    params,
  });

  return response.data;
}

export async function getArticleBySlug(slug: string) {
  const response = await api.get<{
    success: boolean;
    data: ArticleDetail;
  }>(`/articles/${slug}`);

  return response.data;
}
