import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArticleBySlug, getArticles } from "../services/article.service";
import type { ArticleDetail, ArticlePreview } from "../types/article";

function formatPublishedDate(date: string) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function ArticlePage() {
  const { slug } = useParams();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticlePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function loadArticle(articleSlug: string) {
      try {
        setLoading(true);
        setNotFound(false);
        setError(null);

        const response = await getArticleBySlug(articleSlug);
        const currentArticle = response.data;

        setArticle(currentArticle);

        try {
          const relatedResponse = await getArticles({
            category: currentArticle.category,
            page: 1,
            limit: 4,
          });

          setRelatedArticles(
            relatedResponse.data
              .filter((item) => item.slug !== currentArticle.slug)
              .slice(0, 3),
          );
        } catch {
          setRelatedArticles([]);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          "statusCode" in error &&
          (error as { statusCode?: number }).statusCode === 404
        ) {
          setNotFound(true);
        } else {
          setError("Unable to load this article. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadArticle(slug);
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc]">
        <p className="font-['DM_Sans'] text-sm text-slate-500">
          Loading article...
        </p>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-[60vh] bg-[#f8fafc] px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-['Outfit'] text-6xl font-extrabold text-[#1a73e8]/20">
            404
          </span>

          <h1 className="mt-4 font-['Outfit'] text-3xl font-bold text-slate-900">
            Article not found
          </h1>

          <p className="mt-3 font-['DM_Sans'] text-slate-600">
            The article you're looking for doesn't exist or may have been
            removed.
          </p>

          <Link
            to="/health-articles"
            className="mt-7 inline-flex h-11 items-center rounded-xl bg-[#1a73e8] px-5 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Health Articles
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] bg-[#f8fafc] px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-['Outfit'] text-3xl font-bold text-slate-900">
            Something went wrong
          </h1>

          <p className="mt-3 font-['DM_Sans'] text-slate-600">{error}</p>

          <Link
            to="/health-articles"
            className="mt-7 inline-flex h-11 items-center rounded-xl bg-[#1a73e8] px-5 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Health Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] text-slate-900">
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 pb-10 pt-12 lg:px-8 lg:pb-14 lg:pt-16">
          <Link
            to="/health-articles"
            className="inline-flex items-center gap-2 font-['DM_Sans'] text-sm font-medium text-slate-500 transition hover:text-[#1a73e8]"
          >
            <span aria-hidden="true">←</span>
            Back to Health Articles
          </Link>

          <div className="mt-10">
            <span className="inline-flex rounded-full bg-[#1a73e8]/10 px-3 py-1.5 font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
              {article.category}
            </span>

            <h1 className="mt-5 font-['Outfit'] text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
              {article.title}
            </h1>

            <p className="mt-6 max-w-3xl font-['DM_Sans'] text-lg leading-8 text-slate-600">
              {article.excerpt}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 font-['DM_Sans'] text-sm text-slate-500">
              <span className="font-medium text-slate-700">
                {article.source}
              </span>

              <span aria-hidden="true">•</span>

              <span>{formatPublishedDate(article.publishedAt)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 pb-12 lg:px-8 lg:pb-16">
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            {article.imageUrl ? (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="aspect-2/1 w-full object-cover"
              />
            ) : (
              <div className="flex aspect-2/1 items-center justify-center font-['DM_Sans'] text-sm text-slate-400">
                No image available
              </div>
            )}
          </div>
        </div>
      </section>
      

      <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
        <article className="font-['DM_Sans'] text-base leading-8 text-slate-700">
          <div className="whitespace-pre-line">{article.content}</div>

          <div className="mt-12 rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h3 className="font-['Outfit'] text-lg font-bold text-slate-900">
              Remember
            </h3>

            <p className="mt-2 font-['DM_Sans'] text-sm leading-6 text-slate-600">
              Health information is intended for general educational purposes.
              For personal medical concerns, consult a qualified healthcare
              professional.
            </p>
          </div>

          <div className="mt-12 border-t border-slate-200 pt-8">
            <p className="font-['DM_Sans'] text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Article source
            </p>

            <div className="mt-3">
              <p className="font-['DM_Sans'] text-sm font-semibold text-slate-800">
                {article.source}
              </p>

              <p className="mt-1 font-['DM_Sans'] text-sm text-slate-500">
                This article is provided for general health information.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-['DM_Sans'] text-xs leading-5 text-slate-500">
              <span className="font-semibold text-slate-700">
                Health information notice:
              </span>{" "}
              Articles on Medico are intended for general informational and
              educational purposes and should not be considered a substitute for
              professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </article>
      </main>

      {relatedArticles.length > 0 && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <div>
              <p className="font-['DM_Sans'] text-sm font-semibold uppercase tracking-[0.14em] text-[#1a73e8]">
                Keep reading
              </p>

              <h2 className="mt-2 font-['Outfit'] text-2xl font-bold text-slate-900 sm:text-3xl">
                Related articles
              </h2>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/health-articles/${related.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    {related.imageUrl ? (
                      <img
                        src={related.imageUrl}
                        alt={related.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-['DM_Sans'] text-xs text-slate-400">
                        No image available
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <span className="font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
                      {related.category}
                    </span>

                    <h3 className="mt-2 font-['Outfit'] text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#1a73e8]">
                      {related.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 font-['DM_Sans'] text-xs leading-5 text-slate-500">
                      {related.excerpt}
                    </p>

                    <p className="mt-3 font-['DM_Sans'] text-xs text-slate-500">
                      {related.source} ·{" "}
                      {formatPublishedDate(related.publishedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/health-articles"
                className="font-['DM_Sans'] text-sm font-semibold text-[#1a73e8] hover:text-blue-700"
              >
                View all health articles →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default ArticlePage;
