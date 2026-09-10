import { Link } from "react-router-dom";

const principles = [
  {
    title: "Patient First",
    description:
      "Healthcare should begin with understanding the patient's needs. Medico keeps the patient experience simple, clear, and accessible.",
  },
  {
    title: "Built on Trust",
    description:
      "From verified healthcare professionals to secure patient information, trust is at the center of everything we build.",
  },
  {
    title: "Simple by Design",
    description:
      "Finding the right healthcare should not feel complicated. Medico brings important healthcare journeys together in one place.",
  },
  {
    title: "Connected Care",
    description:
      "We connect patients, doctors, and healthcare facilities so that everyone involved can work from the same connected ecosystem.",
  },
];

const ecosystem = [
  {
    number: "01",
    title: "Patients",
    description:
      "Discover healthcare professionals and facilities, explore available services, and manage appointments from one place.",
  },
  {
    number: "02",
    title: "Doctors",
    description:
      "Build a professional presence, manage consultations, and stay connected with the patients who rely on your care.",
  },
  {
    number: "03",
    title: "Healthcare Facilities",
    description:
      "Give clinics and healthcare facilities a connected way to manage services, appointments, and patient interactions.",
  },
];

function AboutPage() {
  return (
    <div className="bg-[#f8fafc] text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#1a73e8]/5 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-[#1a73e8]/10 px-4 py-2 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]">
              About Medico
            </span>

            <h1 className="mt-6 font-['Outfit'] text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Making healthcare{" "}
              <span className="text-[#1a73e8]">simpler, connected,</span> and
              accessible.
            </h1>

            <p className="mt-6 max-w-2xl font-['DM_Sans'] text-base leading-7 text-slate-600 sm:text-lg">
              Medico is a healthcare ecosystem designed to bring patients,
              doctors, and healthcare facilities closer together through a
              simple digital experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/doctors"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1a73e8] px-6 font-['DM_Sans'] text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Find a Doctor
              </Link>

              <Link
                to="/apply-as-doctor"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 font-['DM_Sans'] text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Join as a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="font-['DM_Sans'] text-sm font-semibold uppercase tracking-[0.16em] text-[#1a73e8]">
              Our Mission
            </p>

            <h2 className="mt-3 font-['Outfit'] text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Healthcare should be easier to navigate.
            </h2>
          </div>

          <div className="space-y-5 font-['DM_Sans'] text-base leading-7 text-slate-600">
            <p>
              Healthcare can involve multiple people, facilities, records,
              appointments, and decisions. When these experiences are
              disconnected, even simple tasks can become unnecessarily
              difficult.
            </p>

            <p>
              Medico aims to create a connected digital layer around these
              everyday healthcare interactions. Our goal is to make it easier
              for patients to discover care, for doctors to connect with
              patients, and for healthcare facilities to manage their services.
            </p>

            <p>
              We believe technology should reduce complexity in healthcare, not
              add to it.
            </p>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="font-['DM_Sans'] text-sm font-semibold uppercase tracking-[0.16em] text-[#1a73e8]">
              The Medico Ecosystem
            </p>

            <h2 className="mt-3 font-['Outfit'] text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              One platform. A connected healthcare experience.
            </h2>

            <p className="mt-4 font-['DM_Sans'] text-base leading-7 text-slate-600">
              Medico is designed around the people and organizations that make
              healthcare possible.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {ecosystem.map((item) => (
              <div
                key={item.number}
                className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50"
              >
                <span className="font-['Outfit'] text-4xl font-extrabold text-[#1a73e8]/20">
                  {item.number}
                </span>

                <h3 className="mt-5 font-['Outfit'] text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 font-['DM_Sans'] text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-['DM_Sans'] text-sm font-semibold uppercase tracking-[0.16em] text-[#1a73e8]">
              What We Stand For
            </p>

            <h2 className="mt-3 font-['Outfit'] text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Principles behind Medico.
            </h2>

            <p className="mt-5 max-w-md font-['DM_Sans'] text-base leading-7 text-slate-600">
              Every part of Medico is built around making healthcare
              interactions more understandable, reliable, and convenient.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {principles.map((principle) => (
              <div key={principle.title}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a73e8]/10 font-['Outfit'] text-sm font-bold text-[#1a73e8]">
                  +
                </div>

                <h3 className="font-['Outfit'] text-lg font-bold text-slate-900">
                  {principle.title}
                </h3>

                <p className="mt-2 font-['DM_Sans'] text-sm leading-6 text-slate-600">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Medico */}
      <section className="bg-[#0f172a]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-['DM_Sans'] text-sm font-semibold uppercase tracking-[0.16em] text-blue-400">
                Why Medico
              </p>

              <h2 className="mt-3 font-['Outfit'] text-3xl font-bold leading-tight text-white sm:text-4xl">
                Technology that works around healthcare, not the other way
                around.
              </h2>
            </div>

            <p className="font-['DM_Sans'] text-base leading-7 text-slate-300">
              Medico is being built as a long-term healthcare ecosystem where
              different parts of the healthcare journey can work together.
              Instead of creating another isolated healthcare service, our focus
              is on creating a foundation where patients, professionals, and
              facilities can interact through a consistent digital experience.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="overflow-hidden rounded-3xl bg-[#1a73e8] px-6 py-12 text-center sm:px-12 sm:py-16">
            <p className="font-['DM_Sans'] text-sm font-semibold uppercase tracking-[0.16em] text-blue-100">
              Start with Medico
            </p>

            <h2 className="mx-auto mt-3 max-w-2xl font-['Outfit'] text-3xl font-bold text-white sm:text-4xl">
              Take the next step towards simpler healthcare.
            </h2>

            <p className="mx-auto mt-4 max-w-xl font-['DM_Sans'] text-base leading-7 text-blue-100">
              Whether you are looking for a doctor or building your healthcare
              practice, Medico is here to connect you with the right experience.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/doctors"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8] transition hover:bg-blue-50"
              >
                Find a Doctor
              </Link>

              <Link
                to="/apply-as-doctor"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-6 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Join Medico
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
