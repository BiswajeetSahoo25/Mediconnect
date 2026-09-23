export type ArticleType = "MEDICO" | "EXTERNAL";

export interface ArticlePreview {
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  source: string;
  publishedAt: string;
  externalUrl?: string;
  type: ArticleType;
}

export interface ArticleDetail extends ArticlePreview {
  content?: string;
  author?: {
    id: string;
    name: string;
  };
}
