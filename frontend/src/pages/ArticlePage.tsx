import { Link, useParams } from "react-router-dom";

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  source: string;
  readTime: string;
  publishedAt: string;
  imageUrl: string;
};

const articles: Article[] = [
  {
    slug: "building-a-healthier-daily-routine",
    title: "Building a Healthier Daily Routine",
    excerpt:
      "Small, consistent habits can make a meaningful difference to your overall health and wellbeing.",
    category: "Wellness",
    source: "Medico",
    readTime: "5 min read",
    publishedAt: "Sep 7, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=85",
  },
  {
    slug: "simple-ways-to-stay-active",
    title: "Simple Ways to Stay Active Every Day",
    excerpt:
      "You don't always need a complicated workout plan. Discover simple ways to add more movement to your day.",
    category: "Fitness",
    source: "WHO",
    readTime: "4 min read",
    publishedAt: "Sep 5, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=85",
  },
  {
    slug: "understanding-balanced-nutrition",
    title: "Understanding the Basics of Balanced Nutrition",
    excerpt:
      "Learn how a balanced diet can support energy, wellbeing, and long-term health.",
    category: "Nutrition",
    source: "NHS",
    readTime: "6 min read",
    publishedAt: "Sep 3, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1600&q=85",
  },
  {
    slug: "protecting-your-mental-wellbeing",
    title: "Taking Care of Your Mental Wellbeing",
    excerpt:
      "Understanding your mental wellbeing is an important part of taking care of your overall health.",
    category: "Mental Health",
    source: "WHO",
    readTime: "5 min read",
    publishedAt: "Sep 1, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=85",
  },
  {
    slug: "why-preventive-care-matters",
    title: "Why Preventive Healthcare Matters",
    excerpt:
      "Regular health checks and preventive care can help you make informed decisions about your health.",
    category: "Preventive Care",
    source: "NHS",
    readTime: "5 min read",
    publishedAt: "Aug 30, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85",
  },
  {
    slug: "getting-better-sleep",
    title: "Simple Habits for Better Sleep",
    excerpt:
      "A few changes to your daily routine can help create healthier sleep habits.",
    category: "Wellness",
    source: "Medico",
    readTime: "4 min read",
    publishedAt: "Aug 28, 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1511295742362-92c96b1cf484?auto=format&fit=crop&w=1600&q=85",
  },
];

function ArticlePage() {
  const { slug } = useParams();

  const article = articles.find((item) => item.slug === slug);

  if (!article) {
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

  const relatedArticles = articles
    .filter(
      (item) =>
        item.slug !== article.slug && item.category === article.category,
    )
    .slice(0, 3);

  return (
    <div className="bg-[#f8fafc] text-slate-900">
      {/* Article header */}
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

              <span>{article.publishedAt}</span>

              <span aria-hidden="true">•</span>

              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cover image */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-12 lg:px-8 lg:pb-16">
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="aspect-[16/8] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article content */}
      <main className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
        <article className="font-['DM_Sans'] text-base leading-8 text-slate-700">
          <p>
            Taking care of your health doesn't always require making dramatic
            changes to your lifestyle. In many cases, small habits practiced
            consistently can become an important part of a healthier daily
            routine.
          </p>

          <h2 className="mt-12 font-['Outfit'] text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Start with small, realistic changes
          </h2>

          <p className="mt-5">
            A sustainable routine is one that fits naturally into your everyday
            life. Instead of trying to change everything at once, focus on one
            or two habits that you can maintain consistently.
          </p>

          <p className="mt-5">
            This could mean adding more movement throughout the day, choosing
            balanced meals more often, maintaining a regular sleep schedule, or
            simply making time to relax and recharge.
          </p>

          <h2 className="mt-12 font-['Outfit'] text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Make movement part of your day
          </h2>

          <p className="mt-5">
            Physical activity doesn't have to mean spending hours at the gym.
            Walking, taking the stairs, stretching, cycling, or participating in
            an activity you enjoy can all help you stay active.
          </p>

          <h2 className="mt-12 font-['Outfit'] text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Don't overlook rest
          </h2>

          <p className="mt-5">
            Rest and recovery are also important parts of a healthy lifestyle.
            Creating a consistent sleep routine and giving yourself time to
            recover can support both physical and mental wellbeing.
          </p>

          <div className="mt-12 rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h3 className="font-['Outfit'] text-lg font-bold text-slate-900">
              Remember
            </h3>

            <p className="mt-2 font-['DM_Sans'] text-sm leading-6 text-slate-600">
              Healthy habits don't have to be perfect. Focus on changes that are
              realistic for you and build consistency over time.
            </p>
          </div>

          {/* Source */}
          <div className="mt-12 border-t border-slate-200 pt-8">
            <p className="font-['DM_Sans'] text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Article source
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-['DM_Sans'] text-sm font-semibold text-slate-800">
                  {article.source}
                </p>

                <p className="mt-1 font-['DM_Sans'] text-sm text-slate-500">
                  This article is provided for general health information.
                </p>
              </div>

              <a
                href="#"
                className="inline-flex items-center gap-2 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8] transition hover:text-blue-700"
              >
                Read original source
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          {/* Disclaimer */}
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

      {/* Related articles */}
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
                  key={related.slug}
                  to={`/health-articles/${related.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    <img
                      src={related.imageUrl}
                      alt={related.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-5">
                    <span className="font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
                      {related.category}
                    </span>

                    <h3 className="mt-2 font-['Outfit'] text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#1a73e8]">
                      {related.title}
                    </h3>

                    <p className="mt-2 font-['DM_Sans'] text-xs text-slate-500">
                      {related.source} · {related.readTime}
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
