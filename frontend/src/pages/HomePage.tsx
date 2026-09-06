import { Link } from "react-router-dom";

const heroImage =
  "https://www.figma.com/api/mcp/asset/9b0fb92d-240e-40e2-a99e-1ffc93fe07d8.png";

const searchIcon =
  "https://www.figma.com/api/mcp/asset/1bd7da44-fd25-4754-97c3-11f13b956965.svg";

const ambulanceIcon =
  "https://www.figma.com/api/mcp/asset/d1c2277f-14b4-4a61-9cac-01f3d57c8971.svg";

const videoIcon =
  "https://www.figma.com/api/mcp/asset/813d4a64-315d-4543-926e-7feb7b4b89ac.svg";

const testIcon =
  "https://www.figma.com/api/mcp/asset/7bb64f44-93a6-4809-ad89-0d5c25d5dce8.svg";

const pillIcon =
  "https://www.figma.com/api/mcp/asset/570da8f2-a1ad-46d8-9481-fdfe208044a0.svg";

const heartIcon =
  "https://www.figma.com/api/mcp/asset/62f578d3-5b28-470c-98f2-7c33be852863.svg";

const arrowIcon =
  "https://www.figma.com/api/mcp/asset/08ac0833-a06e-497e-930e-bcf9c542df14.svg";

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
  "https://www.figma.com/api/mcp/asset/f93f1de8-28ab-4d61-b6e6-ef34ed3115e3.png",
  "https://www.figma.com/api/mcp/asset/7c9a58a8-681a-45a8-bc51-06614aba1528.png",
  "https://www.figma.com/api/mcp/asset/40bcaa28-03a6-47b5-ba80-0045f2a38d03.png",
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

const nearbyFacilities = [
  {
    name: "Apollo Clinic",
    type: "Multi-specialty Clinic",
    distance: "1.2 km away",
    address: "100 Feet Road, Indiranagar",
    rating: "4.8",
    services: "25+ Specialties",
  },
  {
    name: "Manipal Hospital",
    type: "Multi-specialty Hospital",
    distance: "2.4 km away",
    address: "HAL Airport Road, Bengaluru",
    rating: "4.7",
    services: "40+ Specialties",
  },
  {
    name: "Cloudnine Hospital",
    type: "Women & Children",
    distance: "3.1 km away",
    address: "Old Airport Road, Bengaluru",
    rating: "4.9",
    services: "15+ Specialties",
  },
];

function HomePage() {
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

              {/* Search */}
              <div className="flex w-full items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white p-2 shadow-[0_8px_12px_rgba(15,23,42,0.05)]">
                <div className="flex min-w-0 flex-1 items-center gap-3 pl-4">
                  <img src={searchIcon} alt="" className="h-5 w-5 shrink-0" />

                  <input
                    type="text"
                    placeholder="Search doctors, specialties, clinics..."
                    className="w-full bg-transparent text-base text-[#334155] outline-none placeholder:text-[#64748b]"
                  />
                </div>

                <Link
                  to="/doctors"
                  className="shrink-0 rounded-lg bg-[#1a73e8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#155fc4]"
                >
                  Find Doctors
                </Link>
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
                  src={arrowIcon}
                  alt=""
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
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
      </section>

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
                {/* Card body */}
                <div className="flex flex-col gap-4 p-5">
                  {/* Doctor identity */}
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

                  {/* Rating + Fee */}
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

                  {/* Clinic */}
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

                {/* Card footer */}
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

      {/* Nearby Healthcare Facilities */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-['Outfit'] text-2xl font-bold">
              Healthcare Near You
            </h2>

            <p className="mt-1 text-sm text-[#64748b]">
              Find trusted clinics and hospitals around your location
            </p>
          </div>

          <Link
            to="/doctors"
            className="shrink-0 text-sm font-semibold text-[#1a73e8] hover:underline"
          >
            Explore Nearby →
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {nearbyFacilities.map((facility) => (
            <article
              key={facility.name}
              className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(15,23,42,0.07)]"
            >
              {/* Facility image placeholder */}
              <div className="flex h-40 items-center justify-center bg-[#f0f5fd]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  🏥
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-['Outfit'] text-lg font-semibold">
                      {facility.name}
                    </h3>

                    <p className="mt-1 text-sm text-[#1a73e8]">
                      {facility.type}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 rounded-md bg-[#fff7ed] px-2 py-1">
                    <span className="text-xs">★</span>
                    <span className="text-xs font-bold">{facility.rating}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[#64748b]">
                  <p className="flex items-center gap-2">
                    <span>📍</span>
                    {facility.distance}
                  </p>

                  <p className="flex items-center gap-2">
                    <span>🏠</span>
                    <span className="truncate">{facility.address}</span>
                  </p>

                  <p className="flex items-center gap-2">
                    <span>⚕️</span>
                    {facility.services}
                  </p>
                </div>

                <Link
                  to="/doctors"
                  className="mt-5 flex w-full items-center justify-center rounded-lg border border-[#1a73e8] px-5 py-2.5 text-sm font-semibold text-[#1a73e8] transition hover:bg-[#f0f5fd]"
                >
                  View Doctors
                </Link>
              </div>
            </article>
          ))}
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

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              category: "Heart Health",
              title: "Simple habits that can improve your heart health",
              description:
                "Learn practical lifestyle habits that can help support a healthier heart.",
              readTime: "5 min read",
              emoji: "❤️",
            },
            {
              category: "Mental Wellness",
              title: "Understanding stress and taking care of your mind",
              description:
                "Small everyday changes can make a meaningful difference to your mental wellbeing.",
              readTime: "4 min read",
              emoji: "🧠",
            },
            {
              category: "Healthy Living",
              title: "Everyday habits for a healthier lifestyle",
              description:
                "Explore simple ways to build healthier routines around food, sleep and activity.",
              readTime: "6 min read",
              emoji: "🌱",
            },
          ].map((article) => (
            <article
              key={article.title}
              className="group overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white transition hover:-translate-y-1 hover:shadow-[0_8px_18px_rgba(15,23,42,0.07)]"
            >
              {/* Article image placeholder */}
              <div className="flex h-40 items-center justify-center bg-[#eaf6ff]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  {article.emoji}
                </div>
              </div>

              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#1a73e8]">
                  {article.category}
                </span>

                <h3 className="mt-2 font-['Outfit'] text-lg font-semibold leading-6 text-[#0f172a] transition group-hover:text-[#1a73e8]">
                  {article.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#64748b]">
                  {article.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-[#64748b]">
                    {article.readTime}
                  </span>

                  <Link
                    to="/health"
                    className="text-sm font-semibold text-[#1a73e8]"
                  >
                    Read Article →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
