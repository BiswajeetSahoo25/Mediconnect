import { Link } from "react-router-dom";

type HelpTopic = {
  title: string;
  description: string;
  to: string;
};

const helpTopics: HelpTopic[] = [
  {
    title: "Getting started",
    description:
      "Create your account, complete onboarding, and learn how to move around Medico.",
    to: "/faq",
  },
  {
    title: "Finding a doctor",
    description:
      "Search by specialty, review professional profiles, and understand availability.",
    to: "/doctors",
  },
  {
    title: "Finding healthcare facilities",
    description:
      "Discover hospitals and clinics near a selected location, including other cities.",
    to: "/healthcare",
  },
  {
    title: "Appointments",
    description:
      "Book, reschedule, and cancel appointments, and understand consultation types.",
    to: "/appointments",
  },
  {
    title: "Medicines",
    description:
      "Look up medicine information, availability, and prescribing details.",
    to: "/medicines",
  },
  {
    title: "Account & privacy",
    description:
      "Update your profile and personal details, and learn how your data is handled.",
    to: "/privacy",
  },
];

const popularGuides = [
  {
    title: "How do I create a Medico account?",
    description:
      "A walkthrough of signing up and completing onboarding as a patient.",
    to: "/faq",
  },
  {
    title: "How do I book an appointment?",
    description:
      "Choose a doctor, pick a facility, select a slot, and confirm your booking.",
    to: "/faq",
  },
  {
    title: "Can doctors and clinics join the platform?",
    description:
      "How providers apply, get verified, and manage their presence on Medico.",
    to: "/apply-as-doctor",
  },
  {
    title: "How do I update my personal information?",
    description:
      "Manage names, addresses, and emergency contacts from your account settings.",
    to: "/account",
  },
];

const resources = [
  {
    title: "Frequently Asked Questions",
    description:
      "Browse answers grouped by topic, from appointments to account and privacy.",
    to: "/faq",
    action: "Read the FAQs",
  },
  {
    title: "Health Articles",
    description:
      "Explore health and wellbeing articles shared by doctors and providers.",
    to: "/health-articles",
    action: "Browse articles",
  },
  {
    title: "Contact Support",
    description:
      "Reach the Medico team directly when you cannot find the answer you need.",
    to: "/contact",
    action: "Get in touch",
  },
];

function HelpPage() {
  return (
    <div className="bg-[#f8fafc] text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#1a73e8]/5 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 text-center sm:py-24 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1a73e8]/10 px-4 py-2 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]">
            Help Center
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl font-['Outfit'] text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
            How can we help you today?
          </h1>

          <p className="mx-auto mt-5 max-w-2xl font-['DM_Sans'] text-base leading-7 text-slate-600 sm:text-lg">
            Find guides and answers for discovering care, booking appointments,
            managing your account, and getting the most out of Medico.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/faq"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1a73e8] px-6 font-['DM_Sans'] text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Browse FAQs
            </Link>

            <Link
              to="/contact"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 font-['DM_Sans'] text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="font-['DM_Sans'] text-sm font-semibold uppercase tracking-[0.16em] text-[#1a73e8]">
            Browse by topic
          </p>

          <h2 className="mt-3 font-['Outfit'] text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Start with the area you need.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {helpTopics.map((topic) => (
            <Link
              key={topic.title}
              to={topic.to}
              className="group rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a73e8]/10 font-['Outfit'] text-sm font-bold text-[#1a73e8]">
                +
              </div>

              <h3 className="mt-5 font-['Outfit'] text-xl font-bold text-slate-900">
                {topic.title}
              </h3>

              <p className="mt-3 font-['DM_Sans'] text-sm leading-6 text-slate-600">
                {topic.description}
              </p>

              <span className="mt-4 inline-flex items-center gap-1 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]">
                View help
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular guides */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-['DM_Sans'] text-sm font-semibold uppercase tracking-[0.16em] text-[#1a73e8]">
                Popular guides
              </p>

              <h2 className="mt-3 font-['Outfit'] text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                The questions we hear most.
              </h2>

              <p className="mt-5 max-w-md font-['DM_Sans'] text-base leading-7 text-slate-600">
                Short answers to the things patients and providers usually want
                to know first.
              </p>
            </div>

            <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
              {popularGuides.map((guide) => (
                <Link
                  key={guide.title}
                  to={guide.to}
                  className="block px-6 py-5 transition hover:bg-[#f8fafc]"
                >
                  <h3 className="text-base font-semibold text-slate-800">
                    {guide.title}
                  </h3>

                  <p className="mt-2 font-['DM_Sans'] text-sm leading-6 text-slate-600">
                    {guide.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {resources.map((resource) => (
            <div
              key={resource.title}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7"
            >
              <h3 className="font-['Outfit'] text-lg font-bold text-slate-900">
                {resource.title}
              </h3>

              <p className="mt-3 flex-1 font-['DM_Sans'] text-sm leading-6 text-slate-600">
                {resource.description}
              </p>

              <Link
                to={resource.to}
                className="mt-6 inline-flex items-center gap-1 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]"
              >
                {resource.action}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency notice */}
      <section className="bg-[#0f172a]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <h2 className="font-['Outfit'] text-2xl font-bold text-white sm:text-3xl">
              Medical emergencies
            </h2>

            <p className="font-['DM_Sans'] text-base leading-7 text-slate-300">
              Medico is not intended for emergency medical care. If you are
              experiencing a life-threatening emergency, contact your local
              emergency services or go to the nearest emergency department.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HelpPage;
