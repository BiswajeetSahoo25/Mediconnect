const sections = [
  {
    title: "Acceptance of Terms",
    content: [
      "By accessing or using MediConnect, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.",
      "These terms apply to all users of MediConnect, including patients, doctors, healthcare facilities, and visitors.",
      "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.",
    ],
  },
  {
    title: "Description of Services",
    content: [
      "MediConnect is a healthcare platform that connects patients with doctors and healthcare facilities. Our services include:",
      "Doctor discovery and professional profile browsing",
      "Healthcare facility search and information",
      "Appointment booking and management",
      "Health articles and educational content",
      "Account management and personal health information storage",
      "MediConnect is a platform that facilitates connections and does not directly provide medical services.",
    ],
  },
  {
    title: "User Accounts",
    content: [
      "To access certain features, you must create an account. You agree to provide accurate and complete information during registration.",
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      "You must notify us immediately if you suspect any unauthorized use of your account.",
      "You may not share your account with others or create multiple accounts for the same individual.",
    ],
  },
  {
    title: "User Responsibilities",
    content: [
      "When using MediConnect, you agree to:",
      "Use the platform only for lawful purposes and in accordance with these terms",
      "Provide accurate and truthful information",
      "Respect the privacy and rights of other users",
      "Not attempt to disrupt or compromise the platform's security",
      "Not use the platform to transmit spam, malware, or other harmful content",
      "Comply with all applicable laws and regulations",
    ],
  },
  {
    title: "Medical Disclaimer",
    content: [
      "MediConnect is a technology platform and does not provide medical advice, diagnosis, or treatment.",
      "The information provided on MediConnect, including doctor profiles, health articles, and facility information, is for general informational purposes only.",
      "Always consult with a qualified healthcare provider for medical advice and treatment decisions.",
      "In case of a medical emergency, contact your local emergency services immediately. Do not rely on MediConnect for emergency medical care.",
      "MediConnect does not guarantee the accuracy, completeness, or timeliness of information provided by third parties on the platform.",
    ],
  },
  {
    title: "Appointments and Bookings",
    content: [
      "When you book an appointment through MediConnect, you are establishing a direct relationship with the healthcare provider.",
      "Appointment terms, including cancellation and rescheduling policies, are set by the healthcare provider.",
      "MediConnect facilitates the booking process but is not a party to the healthcare service agreement between you and the provider.",
      "You are responsible for attending scheduled appointments and adhering to any provider-specific policies.",
    ],
  },
  {
    title: "Intellectual Property",
    content: [
      "All content, features, and functionality of MediConnect, including text, graphics, logos, and software, are the exclusive property of MediConnect or its licensors.",
      "You may not copy, modify, distribute, sell, or lease any part of our platform without prior written consent.",
      "Healthcare providers retain ownership of their professional information and content they publish on the platform.",
    ],
  },
  {
    title: "Limitation of Liability",
    content: [
      "MediConnect is provided 'as is' and 'as available' without warranties of any kind, whether express or implied.",
      "We do not warrant that the platform will be uninterrupted, error-free, or secure.",
      "MediConnect shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.",
      "Our total liability to you for any claims arising from the platform shall not exceed the amount you paid us in the twelve months preceding the claim.",
    ],
  },
  {
    title: "Termination",
    content: [
      "We may suspend or terminate your access to MediConnect at any time, with or without notice, for conduct that we believe violates these terms or is harmful to other users or the platform.",
      "You may terminate your account at any time by contacting us or using the account deletion feature in your settings.",
      "Upon termination, your right to use the platform ceases immediately. We may retain certain information as required by law or for legitimate business purposes.",
    ],
  },
  {
    title: "Governing Law",
    content: [
      "These Terms of Service are governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.",
      "Any disputes arising from these terms or your use of MediConnect shall be resolved in the courts located in California.",
    ],
  },
  {
    title: "Contact Us",
    content: [
      "If you have questions about these Terms of Service, please contact us:",
      "Email: legal@mediconnect.com",
      "Address: MediConnect Legal Team, 123 Healthcare Ave, Medical District, CA 90210",
    ],
  },
];

function TermsOfServicePage() {
  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
            Legal
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Please read these terms carefully before using MediConnect. By using
            our platform, you agree to these terms.
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Last Updated: September 10, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-slate max-w-none">
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-2xl font-bold text-slate-900">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-4">
                  {section.content.map((paragraph, index) => (
                    <p key={index} className="text-base leading-7 text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default TermsOfServicePage;
