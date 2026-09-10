import { useState } from "react";
import { Link } from "react-router-dom";

const doctor = {
  name: "Dr. Sarah Mitchell",
  specialty: "Cardiologist",
  hospital: "Metro Heart Institute",
  image:
    "https://www.figma.com/api/mcp/asset/6a350711-9696-4cf2-9d3f-faca5db465be.png",
  experience: "12 Years",
  consultationFee: "₹800",
  qualification: "MBBS, MD (Cardiology)",
  verified: true,
  rating: "4.9",
  reviews: 124,
  languages: ["English (Fluent)", "Hindi (Fluent)", "Spanish (Conversational)"],
};

const qualifications = [
  {
    degree: "MD – Cardiology",
    institution: "Johns Hopkins University School of Medicine",
    period: "2012 - 2015",
  },
  {
    degree: "MBBS – Bachelor of Medicine",
    institution: "Harvard Medical School",
    period: "2006 - 2012",
  },
];

const certifications = [
  {
    title: "Board Certified in Cardiovascular Disease",
    institution: "American Board of Internal Medicine • 2019",
  },
  {
    title: "Fellow of the American College of Cardiology (FACC)",
    institution: "American College of Cardiology • 2018",
  },
];

const workExperience = [
  {
    role: "Chief Consultative Cardiologist",
    hospital: "Metro Heart Institute",
    period: "2020 - Present",
  },
  {
    role: "Senior Cardiology Consultant",
    hospital: "Mount Sinai Medical Center",
    period: "2016 - 2020",
  },
  {
    role: "Resident Physician – Cardiology",
    hospital: "Johns Hopkins Hospital",
    period: "2012 - 2016",
  },
];

const tabs = [
  "About",
  "Qualifications",
  "Experience",
  "Reviews",
  "Availability",
];

function DoctorProfilePage() {
  const [activeTab, setActiveTab] = useState("About");

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex items-center gap-1 text-xs text-slate-500">
        <Link to="/doctors" className="text-blue-600 hover:underline">
          Find Doctors
        </Link>
        <span>›</span>
        <span>{doctor.specialty}</span>
        <span>›</span>
        <span className="text-slate-700">{doctor.name}</span>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="h-36 w-36 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {doctor.verified && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  ✓ Verified Specialist
                </span>
              )}

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                ★ {doctor.rating} ({doctor.reviews} reviews)
              </span>
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              {doctor.name}
            </h1>

            <p className="mt-1 text-sm font-medium text-blue-600">
              {doctor.specialty} · {doctor.hospital}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Experience
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {doctor.experience}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Consultation
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {doctor.consultationFee}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Qualifications
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {doctor.qualification}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-[#1a73e8] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Book Appointment
              </button>

              <button
                type="button"
                aria-label="Message doctor"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                □
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-xs font-medium transition ${
                activeTab === tab
                  ? "border-b-2 border-[#1a73e8] text-[#1a73e8]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
              {tab === "Reviews" && (
                <span className="ml-1 text-[10px] text-slate-400">
                  {doctor.reviews}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              About Dr. Sarah Mitchell
            </h2>

            <p className="mt-4 text-xs leading-6 text-slate-600">
              Dr. Sarah Mitchell is an acclaimed cardiologist with over 12 years
              of core clinical experience in handling complex cardiac
              conditions. She is deeply passionate about preventative
              cardiology, heart failure management, and valvular heart disease.
              Prior to joining Metro Heart Institute, she served as a Senior
              Cardiology Consultant at Mount Sinai Medical Center.
            </p>

            <div className="mt-5">
              <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                Languages Spoken
              </h3>

              <div className="mt-2 flex flex-wrap gap-2">
                {doctor.languages.map((language) => (
                  <span
                    key={language}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] text-slate-600"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Qualifications & Education
            </h2>

            <div className="mt-5 space-y-5">
              {qualifications.map((item) => (
                <div key={item.degree} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                    🎓
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {item.degree}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {item.institution}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.period}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-slate-100" />

            <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-700">
              Certifications & Licenses
            </h3>

            <div className="mt-4 space-y-4">
              {certifications.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.institution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Work Experience
            </h2>

            <div className="mt-5 space-y-5">
              {workExperience.map((item) => (
                <div key={item.role} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                    🏥
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {item.role}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {item.hospital}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.period}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Availability
              </h2>

              <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Slots Open Today
              </span>
            </div>

            <p className="mt-4 text-[10px] font-semibold text-slate-700">
              Monday
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {["09:00 AM", "11:30 AM", "02:00 PM"].map((time) => (
                <span
                  key={time}
                  className="rounded-md bg-blue-50 px-2 py-1 text-[9px] text-blue-600"
                >
                  {time}
                </span>
              ))}
            </div>

            <div className="my-4 border-t border-slate-100" />

            <p className="text-[10px] font-semibold text-slate-700">Tuesday</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {["10:00 AM", "01:30 PM", "04:00 PM"].map((time) => (
                <span
                  key={time}
                  className="rounded-md bg-blue-50 px-2 py-1 text-[9px] text-blue-600"
                >
                  {time}
                </span>
              ))}
            </div>

            <div className="my-4 border-t border-slate-100" />

            <p className="text-[10px] font-semibold text-slate-700">
              Wednesday
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {["09:00 AM", "11:30 AM", "03:00 PM"].map((time) => (
                <span
                  key={time}
                  className="rounded-md bg-blue-50 px-2 py-1 text-[9px] text-blue-600"
                >
                  {time}
                </span>
              ))}
            </div>

            <div className="my-4 border-t border-slate-100" />

            <p className="text-[10px] font-semibold text-slate-700">Thursday</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {["02:00 PM", "04:30 PM"].map((time) => (
                <span
                  key={time}
                  className="rounded-md bg-blue-50 px-2 py-1 text-[9px] text-blue-600"
                >
                  {time}
                </span>
              ))}
            </div>

            <div className="my-4 border-t border-slate-100" />

            <p className="text-[10px] font-semibold text-slate-700">Friday</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {["09:00 AM", "11:30 AM"].map((time) => (
                <span
                  key={time}
                  className="rounded-md bg-blue-50 px-2 py-1 text-[9px] text-blue-600"
                >
                  {time}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default DoctorProfilePage;
