import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArticles } from "../features/articles";
import type { ArticlePreview } from "../features/articles";
import { search } from "../assets/icons";
import * as homeIcons from "../assets/homePageIcons";

const heroImage =
  "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const healthcareImage =
  "https://plus.unsplash.com/premium_photo-1698421947098-d68176a8f5b2?q=80&w=752&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=1200&q=85";

const searchIcon = search;

const ambulanceIcon = homeIcons.ambulanceIconSvg;
const videoIcon = homeIcons.videoIconSvg;
const testIcon = homeIcons.testIconSvg;
const pillIcon = homeIcons.pillIconSvg;
const heartIcon = homeIcons.heartIconSvg;
const arrowRightIcon = homeIcons.arrowRightSvg;

const quickActions = [
  {
    title: "Find a Doctor",
    description: "Book physical visits with clinical experts nearby.",
    action: "Consult now",
    icon: ambulanceIcon,
    to: "/doctors",
  },
  {
    title: "Video Consultation",
    description: "Connect instantly with doctors in under 10 minutes.",
    action: "Consult now",
    icon: videoIcon,
    to: "/doctors",
  },
  {
    title: "Diagnostic Tests",
    description: "Reliable lab tests done from the comfort of home.",
    action: "Consult now",
    icon: testIcon,
    to: "/doctors",
  },
  {
    title: "Pharmacies",
    description: "Get prescription medications delivered in 2 hours.",
    action: "Explore",
    icon: pillIcon,
    to: "/medicines",
  },
  {
    title: "Health Checkups",
    description: "Comprehensive screenings for the entire family.",
    action: "Explore",
    icon: heartIcon,
    to: "/doctors",
  },
];

const stethoscopeIcon =
  "https://www.figma.com/api/mcp/asset/2a14ca8b-a4f9-4017-9519-cd607b228abd.svg";

const dentistIcon =
  "https://www.figma.com/api/mcp/asset/9c4cedbc-1d22-4529-acb8-f0d0d534534d.svg";

const heartPulseIcon =
  "https://www.figma.com/api/mcp/asset/a336e6c9-31b7-4d11-afed-6149130a8d6e.svg";

const babyIcon =
  "https://www.figma.com/api/mcp/asset/df642b1f-ac7d-434a-8351-b9edb421fd92.svg";

const boneIcon =
  "https://www.figma.com/api/mcp/asset/97656345-1dc0-4b56-8aa7-06aff68baff3.svg";

const earIcon =
  "https://www.figma.com/api/mcp/asset/ee97e6a3-aa35-4500-a7b1-90af038e038a.svg";

const starIcon =
  "https://www.figma.com/api/mcp/asset/443f97b2-2c97-4636-b11d-0b0c6a27c019.svg";

const hospitalIcon =
  "https://www.figma.com/api/mcp/asset/71c571f0-a428-4212-aa50-e539fa7ea9e9.svg";

const doctorAvatars = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10",
];

const specialties = [
  {
    name: "General Physician",
    icon: stethoscopeIcon,
  },
  {
    name: "Dentist",
    icon: dentistIcon,
  },
  {
    name: "Dermatologist",
    icon: dentistIcon,
  },
  {
    name: "Cardiologist",
    icon: heartPulseIcon,
  },
  {
    name: "Gynecologist",
    icon: babyIcon,
  },
  {
    name: "Pediatrician",
    icon: babyIcon,
  },
  {
    name: "Orthopedic",
    icon: boneIcon,
  },
  {
    name: "ENT Specialist",
    icon: earIcon,
  },
];

const recommendedDoctors = [
  {
    name: "Dr. Priya Sharma",
    specialty: "Gynecologist & Obstetrician",
    experience: "15 Years Experience",
    rating: "4.9",
    fee: "₹600",
    clinic: "Care Women's Clinic, Indiranagar",
    avatar: doctorAvatars[0],
  },
  {
    name: "Dr. Rajesh Patel",
    specialty: "Cardiologist",
    experience: "18 Years Experience",
    rating: "4.8",
    fee: "₹800",
    clinic: "Heart Health Centre, Jayanagar",
    avatar: doctorAvatars[1],
  },
  {
    name: "Dr. Amit Verma",
    specialty: "Dermatologist",
    experience: "12 Years Experience",
    rating: "4.7",
    fee: "₹500",
    clinic: "Skin & Aesthetics Studio, Koramangala",
    avatar: doctorAvatars[2],
  },
];

const defaultArticleImages: Record<string, string> = {
  "Heart Health":
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
  Nutrition:
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
  Fitness:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
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

function HomePage() {
  const [articles, setArticles] = useState<ArticlePreview[]>([]);

  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await getArticles({
          page: 1,
          limit: 3,
        });

        setArticles(response.data.slice(0, 3));
      } catch {
        setArticles([]);
      }
    }

    loadArticles();
  }, []);

  return (
    <div className="bg-[#f8fafc] text-[#0f172a]">
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center lg:px-10 lg:py-16">
          <div className="flex-1">
            <div className="flex max-w-2xl flex-col gap-6">
              <div className="w-fit rounded-md bg-[#f0f5fd] px-2.5 py-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#1a73e8]">
                  India's Trusted Healthcare Platform
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="font-['Outfit'] text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[56px]">
                  Your Health, Our Priority. Find &amp; Book the Best Doctors.
                </h1>

                <p className="max-w-2xl text-base leading-7 text-[#64748b] sm:text-lg">
                  Compare ratings, experience, and fee across top clinical
                  experts in your city. Book instant consultations without the
                  long queues.
                </p>
              </div>

              <div className="flex w-full items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white p-2 shadow-[0_8px_12px_rgba(15,23,42,0.05)]">
                <div className="flex min-w-0 flex-1 items-center gap-3 pl-4">
                  <img src={searchIcon} alt="" className="h-6 w-6 shrink-0" />

                  <input
                    type="text"
                    placeholder="Search doctors, specialties, clinics..."
                    className="w-full bg-transparent text-base text-[#334155] outline-none placeholder:text-[#64748b]"
                  />

                  <Link
                    to="/doctors"
                    className="shrink-0 rounded-lg bg-[#1a73e8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#155fc4]"
                  >
                    Find Doctors
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-[520px]">
            <img
              src={heroImage}
              alt="Healthcare professionals"
              className="h-[300px] w-full rounded-3xl object-cover sm:h-[360px] lg:h-[400px]"
            />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        <h2 className="mb-6 font-['Outfit'] text-2xl font-bold">
          What are you looking for today?
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="group flex min-h-[230px] flex-col rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_4px_6px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(15,23,42,0.08)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f5fd]">
                <img src={action.icon} alt="" className="h-6 w-6" />
              </div>

              <div className="mt-4">
                <h3 className="font-['Outfit'] text-lg font-semibold">
                  {action.title}
                </h3>

                <p className="mt-1.5 text-sm leading-5 text-[#64748b]">
                  {action.description}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-1 pt-6 text-sm font-semibold text-[#1a73e8]">
                <span>{action.action}</span>

                <img
                  src={arrowRightIcon}
                  alt=""
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Specialties */}
      {/* <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-['Outfit'] text-2xl font-bold">
            Popular Specialties
          </h2>

          <Link
            to="/doctors"
            className="shrink-0 text-sm font-semibold text-[#1a73e8] hover:underline"
          >
            View All Specialties →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {specialties.map((specialty) => (
            <Link
              key={specialty.name}
              to={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
              className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-[#e2e8f0] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#1a73e8] hover:shadow-[0_4px_10px_rgba(15,23,42,0.06)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f5fd]">
                <img src={specialty.icon} alt="" className="h-7 w-7" />
              </div>

              <span className="mt-3 text-center font-['Outfit'] text-[15px] font-semibold text-[#0f172a]">
                {specialty.name}
              </span>
            </Link>
          ))}
        </div>
      </section> */}

      {/* Recommended Doctors */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-['Outfit'] text-2xl font-bold">
              Top-Rated Doctors Nearby
            </h2>

            <p className="mt-1 text-sm text-[#64748b]">
              Vetted medical practitioners with verified patient reviews
            </p>
          </div>

          <Link
            to="/doctors"
            className="shrink-0 text-sm font-semibold text-[#1a73e8] hover:underline"
          >
            See More Doctors →
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {recommendedDoctors.map((doctor) => (
            <article
              key={doctor.name}
              className="flex overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white"
            >
              <div className="flex w-full flex-col">
                <div className="flex flex-col gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <h3 className="font-['Outfit'] text-lg font-semibold text-[#0f172a]">
                        {doctor.name}
                      </h3>

                      <p className="mt-1 text-sm text-[#1a73e8]">
                        {doctor.specialty}
                      </p>

                      <p className="mt-1 text-xs text-[#64748b]">
                        {doctor.experience}
                      </p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-[#e2e8f0]" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <img src={starIcon} alt="" className="h-4 w-4" />

                      <span className="text-sm font-bold text-[#0f172a]">
                        {doctor.rating}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[#64748b]">Consultation:</span>

                      <span className="text-sm font-bold text-[#0f172a]">
                        {doctor.fee}
                      </span>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-2">
                    <img
                      src={hospitalIcon}
                      alt=""
                      className="h-4 w-4 shrink-0"
                    />

                    <span className="truncate text-xs text-[#334155]">
                      {doctor.clinic}
                    </span>
                  </div>
                </div>

                <div className="mt-auto border-t border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <Link
                    to="/doctors"
                    className="flex w-full items-center justify-center rounded-lg bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#155fc4]"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Healthcare Discovery */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        <div className="overflow-hidden rounded-3xl border border-[#dbeafe] bg-[#eaf6ff]">
          <div className="grid lg:grid-cols-[1fr_0.9fr]">
            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
              <span className="w-fit rounded-md bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#1a73e8]">
                Healthcare Discovery
              </span>

              <h2 className="mt-5 max-w-xl font-['Outfit'] text-3xl font-bold leading-tight text-[#0f172a] sm:text-4xl">
                Find healthcare near you
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-[#64748b]">
                Need medical help nearby? Discover hospitals and clinics around
                your location, or search for healthcare facilities in any city.
              </p>

              <div className="mt-7">
                <Link
                  to="/healthcare"
                  className="inline-flex items-center rounded-lg bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#155fc4]"
                >
                  Explore Healthcare
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>

            <div className="max-h-[280px] lg:min-h-full">
              <img
                src={healthcareImage}
                alt="Healthcare professional providing medical care"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Medicines */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        <div className="overflow-hidden rounded-3xl border border-[#dbeafe] bg-white">
          <div className="grid lg:grid-cols-[1fr_0.9fr]">
            {/* Left Content */}
            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
              <span className="w-fit rounded-md bg-[#eaf6ff] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#1a73e8]">
                Medicines & Pharmacy
              </span>

              <h2 className="mt-5 max-w-xl font-['Outfit'] text-3xl font-bold leading-tight text-[#0f172a] sm:text-4xl">
                Get medicines delivered to your doorstep
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-[#64748b]">
                Order prescription and everyday medicines from trusted
                pharmacies. Get your medicines delivered quickly and
                conveniently.
              </p>

              <div className="mt-7">
                <Link
                  to="/medicines"
                  className="inline-flex items-center rounded-lg bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#155fc4]"
                >
                  Get Medicines
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative min-h-[280px] bg-[#f0f7ff]">
              <img
                src="https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=1200&q=85"
                alt="Medicines and healthcare"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Appointment */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        <div className="overflow-hidden rounded-2xl bg-[#eaf6ff]">
          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                📅
              </div>

              <div>
                <p className="text-sm font-semibold text-[#1a73e8]">
                  Your Upcoming Appointment
                </p>

                <h2 className="mt-1 font-['Outfit'] text-2xl font-bold">
                  You have no upcoming appointments
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#64748b]">
                  Find a doctor and book your next consultation in just a few
                  clicks. Your appointments will appear here once booked.
                </p>
              </div>
            </div>

            <Link
              to="/doctors"
              className="flex shrink-0 items-center justify-center rounded-lg bg-[#1a73e8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#155fc4]"
            >
              Find a Doctor
            </Link>
          </div>
        </div>
      </section>

      {/* Health Articles */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-['Outfit'] text-2xl font-bold">
              Health & Wellness
            </h2>

            <p className="mt-1 text-sm text-[#64748b]">
              Simple, reliable information to help you make better health
              decisions
            </p>
          </div>

          <Link
            to="/health-articles"
            className="shrink-0 text-sm font-semibold text-[#1a73e8] hover:underline"
          >
            View All Articles →
          </Link>
        </div>

        {articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map((article) => {
              const fallbackImage = getDefaultArticleImage(article.category);

              return (
                <Link
                  key={article.id}
                  to={`/health-articles/${article.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(15,23,42,0.07)]"
                >
                  <div className="aspect-video overflow-hidden bg-[#eaf6ff]">
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
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#1a73e8]">
                      {article.category}
                    </span>

                    <h3 className="mt-2 font-['Outfit'] text-lg font-semibold leading-6 text-[#0f172a] transition group-hover:text-[#1a73e8]">
                      {article.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748b]">
                      {article.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-end">
                      <span className="text-sm font-semibold text-[#1a73e8]">
                        Read Article →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white"
              >
                <div className="h-40 animate-pulse bg-[#eaf6ff]" />

                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
