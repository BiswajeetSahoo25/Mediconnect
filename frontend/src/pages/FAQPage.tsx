import { useState } from "react";

type FAQ = {
  question: string;
  answer: string;
};

const faqSections: { title: string; items: FAQ[] }[] = [
  {
    title: "Getting started",
    items: [
      {
        question: "What is MediConnect?",
        answer:
          "MediConnect is a healthcare platform that helps patients discover doctors, hospitals, and clinics, explore healthcare information, and manage their healthcare journey from one place.",
      },
      {
        question: "How do I create a MediConnect account?",
        answer:
          "Click Sign Up, enter your basic information, and complete the onboarding process. Your account starts as a patient account.",
      },
      {
        question: "Can I use MediConnect without booking an appointment?",
        answer:
          "Yes. You can explore healthcare facilities, find doctors, and read health articles without booking an appointment.",
      },
    ],
  },
  {
    title: "Finding healthcare",
    items: [
      {
        question: "How can I find a doctor?",
        answer:
          "Use the Find Doctors section to browse doctors by specialty and explore their professional profiles.",
      },
      {
        question: "Can I search for healthcare facilities in another city?",
        answer:
          "Yes. MediConnect allows you to search for hospitals and clinics by location, even when the location is different from your current location.",
      },
      {
        question: "Does MediConnect show nearby hospitals and clinics?",
        answer:
          "Yes. You can use the Find Healthcare section to discover hospitals and clinics around a selected location.",
      },
      {
        question: "Are all healthcare facilities on MediConnect verified?",
        answer:
          "MediConnect distinguishes between facilities registered with the platform and facilities discovered through external location services. Registered facilities can be verified through MediConnect.",
      },
    ],
  },
  {
    title: "Appointments",
    items: [
      {
        question: "How do I book an appointment?",
        answer:
          "Choose a doctor, select the relevant healthcare facility, choose an available appointment slot, and confirm your booking.",
      },
      {
        question: "Can I cancel an appointment?",
        answer:
          "Yes. Appointments can be cancelled from your appointments section, subject to the applicable appointment rules.",
      },
      {
        question: "What types of consultations can I have?",
        answer:
          "MediConnect is designed to support different consultation models, including in-person, video, and phone consultations where they are offered.",
      },
    ],
  },
  {
    title: "Doctors and clinics",
    items: [
      {
        question: "Can doctors join MediConnect?",
        answer:
          "Yes. Doctors can apply to become providers on MediConnect. Their professional information can then be reviewed as part of the verification process.",
      },
      {
        question: "Can clinics and hospitals join MediConnect?",
        answer:
          "Yes. Healthcare facilities can be registered on the platform and can eventually manage their presence, services, and appointments through MediConnect.",
      },
      {
        question: "Can doctors share healthcare articles?",
        answer:
          "MediConnect is designed to provide doctors and healthcare facilities with a platform to share healthcare knowledge, articles, experiences, and professional insights.",
      },
    ],
  },
  {
    title: "Account and privacy",
    items: [
      {
        question: "Can I update my personal information?",
        answer:
          "Yes. You can manage your personal information, addresses, emergency contacts, and other account details from Account Settings.",
      },
      {
        question: "Is my healthcare information private?",
        answer:
          "MediConnect is designed with privacy and secure handling of user information in mind. Access to healthcare information is intended to be limited according to the user's account and the platform's permissions.",
      },
      {
        question: "What should I do in a medical emergency?",
        answer:
          "MediConnect should not be relied upon for emergency medical care. If you are experiencing a life-threatening emergency, contact your local emergency services or go to the nearest emergency department.",
      },
    ],
  },
];

function FAQPage() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  function toggleQuestion(question: string) {
    setOpenQuestion((current) => (current === question ? null : question));
  }

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
            Help Center
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Frequently Asked Questions
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Find answers to common questions about discovering healthcare,
            booking appointments, managing your account, and using MediConnect.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-10">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                {section.title}
              </h2>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {section.items.map((faq, index) => {
                  const isOpen = openQuestion === faq.question;

                  return (
                    <div
                      key={faq.question}
                      className={
                        index !== section.items.length - 1
                          ? "border-b border-slate-200"
                          : ""
                      }
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(faq.question)}
                        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                      >
                        <span className="font-semibold text-slate-800">
                          {faq.question}
                        </span>

                        <svg
                          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-5 pr-14 text-sm leading-7 text-slate-600">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Still have questions?
          </h2>

          <p className="mt-3 text-slate-600">
            We're here to help you get the most out of MediConnect.
          </p>

          <a
            href="mailto:support@mediconnect.com"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
}

export default FAQPage;
