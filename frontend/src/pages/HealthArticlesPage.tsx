import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getArticles } from "../services/article.service";
import type { ArticlePreview } from "../types/article";

const categories = [
  "All",
  "Fitness",
  "Nutrition",
  "Wellness",
  "Mental Health",
  "Preventive Care",
];

const defaultArticleImages: Record<string, string> = {
  Fitness:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  Nutrition:
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
  Wellness:
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  "Mental Health":
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  "Preventive Care":
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  default:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
};

function getDefaultArticleImage(category: string) {
  return defaultArticleImages[category] ?? defaultArticleImages.default;
}

function formatPublishedDate(date: string) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function ArticleCard({ article }: { article: ArticlePreview }) {
  const fallbackImage = getDefaultArticleImage(article.category);

  return (
    <Link
      to={`/health-articles/${article.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div className="aspect-video overflow-hidden bg-slate-100">
        <img
          src={article.imageUrl || fallbackImage}
          alt={article.title}
          onError={(event) => {
            if (event.currentTarget.src !== fallbackImage) {
              event.currentTarget.src = fallbackImage;
            }
          }}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#1a73e8]/10 px-3 py-1 font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
            {article.category}
          </span>

          <span className="font-['DM_Sans'] text-xs text-slate-400">
            {formatPublishedDate(article.publishedAt)}
          </span>
        </div>

        <h3 className="mt-4 font-['Outfit'] text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#1a73e8]">
          {article.title}
        </h3>

        <p className="mt-3 line-clamp-2 font-['DM_Sans'] text-sm leading-6 text-slate-600">
          {article.excerpt}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="font-['DM_Sans'] text-xs font-medium text-slate-500">
            {article.source}
          </span>

          <span className="font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
            Read article →
          </span>
        </div>
      </div>
    </Link>
  );
}

function HealthArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "All";
  const search = searchParams.get("search") || "";

  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [articles, setArticles] = useState<ArticlePreview[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        setError(null);

        const response = await getArticles({
          category: selectedCategory === "All" ? undefined : selectedCategory,
          search: search.trim() || undefined,
          page,
          limit: 20,
        });

        setArticles(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalArticles(response.pagination.total);
      } catch {
        setError("Unable to load articles. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, [selectedCategory, search, page]);

  function updateParams(updates: {
    category?: string;
    search?: string;
    page?: number;
  }) {
    const params = new URLSearchParams(searchParams);

    if (updates.category !== undefined) {
      if (updates.category === "All") {
        params.delete("category");
      } else {
        params.set("category", updates.category);
      }
    }

    if (updates.search !== undefined) {
      if (updates.search.trim()) {
        params.set("search", updates.search);
      } else {
        params.delete("search");
      }
    }

    if (updates.page !== undefined) {
      if (updates.page === 1) {
        params.delete("page");
      } else {
        params.set("page", String(updates.page));
      }
    }

    setSearchParams(params);
  }

  function handleCategoryChange(category: string) {
    updateParams({
      category,
      page: 1,
    });
  }

  function handleSearchChange(value: string) {
    updateParams({
      search: value,
      page: 1,
    });
  }

  function handlePreviousPage() {
    if (page > 1) {
      updateParams({ page: page - 1 });
    }
  }

  function handleNextPage() {
    if (page < totalPages) {
      updateParams({ page: page + 1 });
    }
  }

  function handlePageChange(pageNumber: number) {
    updateParams({ page: pageNumber });
  }

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <div className="bg-[#f8fafc] text-slate-900">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-[#1a73e8]/10 px-4 py-2 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]">
              Health & Wellness
            </span>

            <h1 className="mt-5 font-['Outfit'] text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Health information for{" "}
              <span className="text-[#1a73e8]">everyday life.</span>
            </h1>

            <p className="mt-5 max-w-2xl font-['DM_Sans'] text-base leading-7 text-slate-600 sm:text-lg">
              Explore useful information about health, fitness, nutrition,
              wellness, and preventive care from trusted sources.
            </p>
          </div>

          <div className="mt-10 max-w-2xl">
            <label htmlFor="article-search" className="sr-only">
              Search articles
            </label>

            <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-[#1a73e8] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1a73e8]/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 shrink-0 text-slate-400"
                aria-hidden="true"
              >
                <path
                  d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              <input
                id="article-search"
                type="search"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search health articles..."
                className="ml-3 w-full bg-transparent font-['DM_Sans'] text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 font-['DM_Sans'] text-sm font-medium transition ${
                  isSelected
                    ? "bg-[#1a73e8] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#1a73e8]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-['DM_Sans'] text-sm font-semibold uppercase tracking-[0.14em] text-[#1a73e8]">
              Latest articles
            </p>

            <h2 className="mt-2 font-['Outfit'] text-2xl font-bold text-slate-900 sm:text-3xl">
              Stay informed. Stay healthy.
            </h2>
          </div>

          <p className="font-['DM_Sans'] text-sm text-slate-500">
            {totalArticles > 0
              ? `${totalArticles} articles available`
              : "Information from trusted healthcare sources"}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-80 items-center justify-center">
            <p className="font-['DM_Sans'] text-sm text-slate-500">
              Loading articles...
            </p>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
            <p className="font-['DM_Sans'] text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => setSearchParams(new URLSearchParams(searchParams))}
              className="mt-4 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]"
            >
              Try again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
            <h3 className="font-['Outfit'] text-xl font-semibold text-slate-900">
              No articles found
            </h3>

            <p className="mt-2 font-['DM_Sans'] text-sm text-slate-500">
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <>
            <Link
              to={`/health-articles/${featuredArticle.slug}`}
              className="group mt-8 grid overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50 lg:grid-cols-2"
            >
              <div className="aspect-video overflow-hidden bg-slate-100 lg:aspect-auto">
                <img
                  src={
                    featuredArticle.imageUrl ||
                    getDefaultArticleImage(featuredArticle.category)
                  }
                  alt={featuredArticle.title}
                  onError={(event) => {
                    const fallbackImage = getDefaultArticleImage(
                      featuredArticle.category,
                    );

                    if (event.currentTarget.src !== fallbackImage) {
                      event.currentTarget.src = fallbackImage;
                    }
                  }}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[#1a73e8]/10 px-3 py-1 font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
                    Featured
                  </span>

                  <span className="font-['DM_Sans'] text-xs text-slate-400">
                    {featuredArticle.category}
                  </span>
                </div>

                <h2 className="mt-5 font-['Outfit'] text-3xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#1a73e8] sm:text-4xl">
                  {featuredArticle.title}
                </h2>

                <p className="mt-4 font-['DM_Sans'] text-base leading-7 text-slate-600">
                  {featuredArticle.excerpt}
                </p>

                <div className="mt-7 flex items-center gap-3 font-['DM_Sans'] text-sm text-slate-500">
                  <span>{featuredArticle.source}</span>

                  <span>•</span>

                  <span>
                    {formatPublishedDate(featuredArticle.publishedAt)}
                  </span>
                </div>

                <span className="mt-7 inline-flex items-center gap-2 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]">
                  Read article
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>

            {remainingArticles.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {remainingArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-['DM_Sans'] text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:text-[#1a73e8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1,
                    ).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => handlePageChange(pageNumber)}
                        className={`h-10 w-10 rounded-xl font-['DM_Sans'] text-sm font-semibold transition ${
                          page === pageNumber
                            ? "bg-[#1a73e8] text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#1a73e8]"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-['DM_Sans'] text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:text-[#1a73e8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>

                <p className="font-['DM_Sans'] text-xs text-slate-400">
                  Page {page} of {totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HealthArticlesPage;
