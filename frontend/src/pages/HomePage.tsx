import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const careOptions = [
  ["Find a doctor", "Discover the right specialist and choose an available slot.", "Find doctors", "/doctors"],
  ["Manage appointments", "Keep upcoming visits and care plans in one place.", "My appointments", "/appointments"],
  ["Join as a doctor", "Start your clinician verification application online.", "Apply as doctor", "/apply-as-doctor"],
];

function HomePage() {
  const { isAuthenticated } = useAuth();
  const protectedOrSignup = (path: string) => (isAuthenticated ? path : "/signup");

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-[#e8f8fd] via-white to-[#f7fcfe] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#087ca3]">Book care with confidence</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">Your health deserves the right care.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Search trusted doctors, plan appointments and keep your healthcare details in one secure account.</p>

          <div className="mx-auto mt-9 flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-sky-100 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left">
              <span className="text-[#14bef0]">Location</span>
              <span><span className="block text-xs text-slate-500">Near you</span><span className="block text-sm font-medium text-slate-800">Select your city</span></span>
            </div>
            <label className="flex min-w-0 flex-[1.4] items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left">
              <input aria-label="Search doctors" placeholder="Search doctors, specialities or clinics" className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400" />
            </label>
            <Link to={protectedOrSignup("/doctors")} className="rounded-xl bg-[#14bef0] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0daedc]">Search</Link>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-600"><span>Popular:</span><span>Dermatologist</span><span>Dental care</span><span>General physician</span><span>Paediatrician</span></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-sm font-semibold text-[#087ca3]">Healthcare, made simpler</p><h2 className="mt-1 text-2xl font-bold text-slate-900">What can we help you with?</h2></div>
          <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="text-sm font-semibold text-[#087ca3] hover:underline">{isAuthenticated ? "Go to dashboard" : "Create account"}</Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {careOptions.map(([title, copy, label, path]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#14bef0] hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl text-[#14bef0]">+</div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{copy}</p>
              <Link to={protectedOrSignup(path)} className="mt-5 inline-flex text-sm font-semibold text-[#087ca3] hover:underline">{label} →</Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
