import { Link } from "react-router-dom";

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

const categories = [
  "All",
  "Fitness",
  "Nutrition",
  "Wellness",
  "Mental Health",
  "Preventive Care",
];

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
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1511295742362-92c96b1cf484?auto=format&fit=crop&w=1200&q=80",
  },
];

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/health-articles/${article.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#1a73e8]/10 px-3 py-1 font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
            {article.category}
          </span>

          <span className="font-['DM_Sans'] text-xs text-slate-400">
            {article.readTime}
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

          <span className="font-['DM_Sans'] text-xs text-slate-400">
            {article.publishedAt}
          </span>
        </div>
      </div>
    </Link>
  );
}

function HealthArticlesPage() {
  return (
    <div className="bg-[#f8fafc] text-slate-900">
      {/* Header */}
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

          {/* Search */}
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
                placeholder="Search health articles..."
                className="ml-3 w-full bg-transparent font-['DM_Sans'] text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <button
              key={category}
              type="button"
              className={`whitespace-nowrap rounded-full px-4 py-2 font-['DM_Sans'] text-sm font-medium transition ${
                index === 0
                  ? "bg-[#1a73e8] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#1a73e8]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Section heading */}
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
            Information from trusted healthcare sources
          </p>
        </div>

        {/* Featured article */}
        <Link
          to={`/health-articles/${articles[0].slug}`}
          className="group mt-8 grid overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50 lg:grid-cols-2"
        >
          <div className="aspect-[16/10] overflow-hidden bg-slate-100 lg:aspect-auto">
            <img
              src={articles[0].imageUrl}
              alt={articles[0].title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#1a73e8]/10 px-3 py-1 font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
                Featured
              </span>

              <span className="font-['DM_Sans'] text-xs text-slate-400">
                {articles[0].category}
              </span>
            </div>

            <h2 className="mt-5 font-['Outfit'] text-3xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#1a73e8] sm:text-4xl">
              {articles[0].title}
            </h2>

            <p className="mt-4 font-['DM_Sans'] text-base leading-7 text-slate-600">
              {articles[0].excerpt}
            </p>

            <div className="mt-7 flex items-center gap-3 font-['DM_Sans'] text-sm text-slate-500">
              <span>{articles[0].source}</span>
              <span>•</span>
              <span>{articles[0].publishedAt}</span>
              <span>•</span>
              <span>{articles[0].readTime}</span>
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

        {/* Article grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.slice(1).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default HealthArticlesPage;
