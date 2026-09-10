const sections = [
  {
    title: "Information We Collect",
    content: [
      "When you use MediConnect, we collect information that helps us provide and improve our healthcare platform services.",
      "Account Information: When you create an account, we collect your name, email address, date of birth, and other basic profile information you provide during registration.",
      "Health Information: If you choose to share health information through the platform, such as medical history or appointment details, we store this information securely as part of our healthcare services.",
      "Location Data: With your permission, we may collect location information to help you find nearby healthcare facilities and doctors.",
      "Usage Information: We automatically collect information about how you interact with MediConnect, including the pages you visit, features you use, and actions you take.",
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      "We use the information we collect to provide, maintain, and improve MediConnect's healthcare services.",
      "Service Delivery: To facilitate doctor discovery, appointment booking, and healthcare facility connections.",
      "Account Management: To create and manage your account, verify your identity, and provide customer support.",
      "Communication: To send you appointment confirmations, platform updates, and respond to your inquiries.",
      "Improvement: To analyze usage patterns and improve the platform's features and user experience.",
      "Safety: To protect the security and integrity of our platform and users.",
    ],
  },
  {
    title: "Information Sharing",
    content: [
      "We do not sell your personal information to third parties. We may share your information in the following circumstances:",
      "Healthcare Providers: When you book an appointment or interact with a doctor, relevant information is shared with that provider to facilitate your care.",
      "Healthcare Facilities: When you connect with a facility, necessary information is shared to enable appointment management.",
      "Service Providers: We work with trusted third-party services that help us operate our platform, such as hosting, analytics, and communication services.",
      "Legal Requirements: We may disclose information if required by law, regulation, or legal process.",
    ],
  },
  {
    title: "Data Security",
    content: [
      "We take the security of your information seriously and implement appropriate measures to protect it.",
      "Encryption: We use industry-standard encryption to protect data in transit and at rest.",
      "Access Controls: Access to personal and health information is restricted to authorized personnel who need it to perform their duties.",
      "Regular Audits: We conduct regular security assessments to identify and address potential vulnerabilities.",
      "While we implement strong security measures, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Your Rights and Choices",
    content: [
      "You have several rights regarding your personal information:",
      "Access: You can request a copy of the personal information we hold about you.",
      "Correction: You can update or correct your information through your account settings.",
      "Deletion: You can request that we delete your personal information, subject to certain legal exceptions.",
      "Portability: You can request your data in a structured, commonly used format.",
      "Communication Preferences: You can manage your notification settings in your account preferences.",
    ],
  },
  {
    title: "Data Retention",
    content: [
      "We retain your information for as long as your account is active or as needed to provide you services.",
      "Health Records: Medical and health-related information may be retained for longer periods as required by applicable healthcare regulations.",
      "Account Data: If you delete your account, we will remove your personal information within a reasonable timeframe, except where retention is required by law.",
      "Aggregated Data: We may retain anonymized or aggregated data that cannot be used to identify you for analytical purposes.",
    ],
  },
  {
    title: "Children's Privacy",
    content: [
      "MediConnect is not intended for use by children under the age of 13.",
      "We do not knowingly collect personal information from children under 13.",
      "If we learn that we have collected personal information from a child under 13, we will take steps to delete that information promptly.",
      "If you are a parent or guardian and believe your child has provided us with personal information, please contact us.",
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational reasons.",
      "When we make material changes, we will notify you by posting the updated policy on this page and updating the 'Last Updated' date.",
      "We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.",
    ],
  },
  {
    title: "Contact Us",
    content: [
      "If you have questions or concerns about this Privacy Policy or our data practices, please contact us:",
      "Email: privacy@mediconnect.com",
      "Address: MediConnect Privacy Team, 123 Healthcare Ave, Medical District, CA 90210",
    ],
  },
];

function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
            Legal
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Your privacy is important to us. This policy explains how
            MediConnect collects, uses, and protects your personal information.
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Last Updated: September 10, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="prose prose-slate max-w-none">
          <p className="text-base leading-7 text-slate-600">
            At MediConnect ("we," "our," or "us"), we are committed to protecting
            your privacy. This Privacy Policy describes how we collect, use, and
            safeguard information when you use our healthcare platform and
            services.
          </p>

          <div className="mt-12 space-y-12">
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

export default PrivacyPolicyPage;
