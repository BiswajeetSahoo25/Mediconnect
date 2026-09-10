import { Link } from "react-router-dom";
import {
  twitterIcon,
  facebookIcon,
  instagramIcon,
  linkedinIcon,
} from "../assets/icons";

const plusIcon =
  "https://www.figma.com/api/mcp/asset/8e430334-e5e0-4380-ac34-d752a75fffb8.svg";

const patientLinks = [
  { label: "Search Doctors", to: "/doctors" },
  { label: "Book Appointments", to: "/appointments" },
  { label: "Online Consultations", to: "/doctors" },
  { label: "Medicines", to: "#" },
  { label: "Health Articles", to: "/health-articles" },
];

const doctorLinks = [
  { label: "Join Medico", to: "/apply-as-doctor" },
  { label: "Provider Login", to: "/login" },
  { label: "Consulting Dashboard", to: "/doctor-dashboard" },
  { label: "Provider Resources", to: "#" },
  { label: "Clinics Hub", to: "#" },
];

const aboutLinks = [
  { label: "About Medico", to: "/about" },
  { label: "Careers", to: "#" },
  { label: "Press Releases", to: "#" },
  { label: "Sitemap", to: "#" },
  { label: "Contact Us", to: "#" },
];

const legalLinks = [
  { label: "FAQs", to: "#" },
  { label: "Privacy Policy", to: "#" },
  { label: "Terms of Service", to: "#" },
  { label: "IP Policy", to: "#" },
  { label: "Grievance Redressal", to: "#" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      <h3 className="font-['Outfit'] text-[15px] font-bold leading-none text-white">
        {title}
      </h3>

      <div className="flex flex-col items-start gap-3">
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="font-['DM_Sans'] text-[14px] font-normal leading-normal text-[#e2e8f0]/80 transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SocialButton({ icon, label }: { icon: string; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#334155] transition-colors hover:bg-[#1a73e8]"
    >
      <img
        src={icon}
        alt=""
        className="max-h-[18px] max-w-[18px] object-contain brightness-0 invert"
      />
    </a>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0f172a]">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-16 lg:px-20">
        {/* Main footer */}
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-10">
          {/* Brand */}
          <div className="flex w-full flex-col items-start gap-5 lg:w-[280px] lg:shrink-0">
            <Link
              to="/"
              aria-label="Medico home"
              className="flex items-center gap-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a73e8]">
                <img
                  src={plusIcon}
                  alt=""
                  className="h-[18px] w-[18px] brightness-0 invert"
                />
              </span>

              <span className="font-['Outfit'] text-[24px] font-extrabold leading-none text-white">
                Medico
              </span>
            </Link>

            <p className="max-w-[280px] font-['DM_Sans'] text-[14px] font-normal leading-[1.5] text-[#e2e8f0]/80">
              Providing digital access to premium healthcare. Certified clinics,
              verified professionals, and secure patient records.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            <FooterColumn title="For Patients" links={patientLinks} />
            <FooterColumn title="For Doctors" links={doctorLinks} />
            <FooterColumn title="About Us" links={aboutLinks} />
            <FooterColumn title="Help & Legal" links={legalLinks} />
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px w-full bg-[#e2e8f0]/20" />

        {/* Bottom row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-['DM_Sans'] text-[13px] font-normal text-[#e2e8f0]/60">
            © 2026 Medico. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <SocialButton icon={facebookIcon} label="Facebook" />
            <SocialButton icon={twitterIcon} label="Twitter" />
            <SocialButton icon={instagramIcon} label="Instagram" />
            <SocialButton icon={linkedinIcon} label="LinkedIn" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
