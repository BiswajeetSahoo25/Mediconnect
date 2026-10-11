import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDoctorById } from "../index";
import type { Doctor } from "../types";

const doctorAvatar =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10";
const tabs = [
  "About",
  "Professional Details",
  "Experience",
  "Reviews",
  "Availability",
];

type DetailIconKind = "license" | "specialization" | "facility" | "experience";

function DetailIcon({ kind }: { kind: DetailIconKind }) {
  const paths: Record<DetailIconKind, React.ReactNode> = {
    license: <><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    specialization: <><path d="M4 8h5l3 3 3-3h5" /><path d="M7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" /><path d="M8 14a4 4 0 1 0 8 0" /><path d="M12 14v7" /></>,
    facility: <><path d="M3 21h18" /><path d="M5 21V5l7-3 7 3v16" /><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01" /><path d="M10 21v-4h4v4" /></>,
    experience: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-11 0v2h4v-2" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">{paths[kind]}</svg>;
}

function formatConsultationFee(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
    : "Not available";
}

function formatDay(dayOfWeek: number) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return days[dayOfWeek] ?? "Unknown";
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [activeTab, setActiveTab] = useState("About");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctor() {
      if (!id) {
        setError("Doctor ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getDoctorById(id);

        setDoctor(response.data);
      } catch (error) {
        console.error("Failed to fetch doctor profile:", error);
        setError("Failed to load doctor profile.");
      } finally {
        setLoading(false);
      }
    }

    fetchDoctor();
  }, [id]);

  const primarySpecialization = useMemo(() => {
    if (!doctor) {
      return null;
    }

    return (
      doctor.specializations.find(
        (specialization) => specialization.isPrimary,
      ) ?? doctor.specializations[0]
    );
  }, [doctor]);

  const primaryFacility = useMemo(() => {
    return doctor?.facilities[0] ?? null;
  }, [doctor]);

  const doctorName = doctor
    ? `Dr. ${doctor.firstName}${doctor.lastName ? ` ${doctor.lastName}` : ""}`
    : "";

  const availabilityByDay = useMemo(() => {
    if (!primaryFacility?.availability) {
      return [];
    }

    const grouped = new Map<number, typeof primaryFacility.availability>();

    for (const slot of primaryFacility.availability) {
      const existing = grouped.get(slot.dayOfWeek) ?? [];
      existing.push(slot);
      grouped.set(slot.dayOfWeek, existing);
    }

    return Array.from(grouped.entries()).sort(([dayA], [dayB]) => dayA - dayB);
  }, [primaryFacility]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-6xl items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
          <p className="text-sm text-slate-600">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-6xl items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-8 py-8 text-center shadow-sm">
          <p className="text-sm text-red-600">{error ?? "Doctor not found."}</p>

          <Link
            to="/doctors"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1 text-xs text-slate-500">
        <Link to="/doctors" className="text-blue-600 hover:underline">
          Find Doctors
        </Link>

        <span aria-hidden="true">/</span>

        <span>{primarySpecialization?.specialization.name ?? "Specialist"}</span>

        <span aria-hidden="true">/</span>

        <span className="text-slate-700">{doctorName}</span>
      </div>

      {/* Doctor Header */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Doctor Image */}
          <div className="h-36 w-36 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <img
              src={doctorAvatar}
              alt={doctorName}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Doctor Information */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {doctor.licenseVerificationStatus === "VERIFIED" && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  <span className="mr-1" aria-hidden="true">✓</span>Verified specialist
                </span>
              )}

              {doctor.isActive && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                  Active on MediConnect
                </span>
              )}
            </div>

            <h1 className="text-2xl font-semibold text-slate-900">
              {doctorName}
            </h1>

            <p className="mt-1 text-sm font-medium text-blue-600">
              {primarySpecialization?.specialization.name ?? "Specialist"}
              {primaryFacility?.facility.name
                ? ` | ${primaryFacility.facility.name}`
                : ""}
            </p>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Experience
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {doctor.yearsOfExperience
                    ? `${doctor.yearsOfExperience} Years`
                    : "Not available"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Consultation
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {primaryFacility
                    ? formatConsultationFee(primaryFacility.consultationFee)
                    : "Not available"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Consultation Mode
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {primaryFacility?.consultationMode ?? "Not available"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center gap-2">
              <Link
                to={`/doctors/${doctor.id}/book`}
                className="rounded-lg bg-[#1a73e8] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Book Appointment
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
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

            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* About */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              About {doctorName}
            </h2>

            <p className="mt-4 whitespace-pre-line text-xs leading-6 text-slate-600">
              {doctor.about ??
                `${doctorName} is a verified ${primarySpecialization?.specialization.name ?? "medical specialist"} on MediConnect.`}
            </p>
          </section>

          {/* Professional Details */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Professional Details
            </h2>

            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <DetailIcon kind="license" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    License Number
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {doctor.licenseNumber}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <DetailIcon kind="license" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    License Authority
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {doctor.licenseAuthority ?? "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <DetailIcon kind="specialization" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Specialization
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {primarySpecialization?.specialization.name ?? "Not available"}
                  </p>

                  {primarySpecialization?.yearsInSpecialization && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      {primarySpecialization.yearsInSpecialization} years in
                      specialization
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <DetailIcon kind="facility" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Department
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {primaryFacility?.department.name ?? "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Experience */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Experience</h2>

            <div className="mt-5">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <DetailIcon kind="experience" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Clinical Experience
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {doctor.yearsOfExperience
                      ? `${doctor.yearsOfExperience} years of clinical experience`
                      : "Experience information not available"}
                  </p>

                  <p className="mt-2 text-[10px] leading-5 text-slate-400">
                    Detailed employment history is not currently stored in the
                    MediConnect doctor profile.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Reviews</h2>

            <div className="mt-5 rounded-lg bg-slate-50 p-5 text-center">
              <p className="text-sm font-medium text-slate-700">
                No reviews available yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Doctor reviews will appear here once patients submit them.
              </p>
            </div>
          </section>
        </div>

        {/* Availability Sidebar */}
        <aside>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Availability
              </h2>

              {primaryFacility?.onlineBookingEnabled && (
                <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online Booking
                </span>
              )}
            </div>

            {availabilityByDay.length > 0 ? (
              <div className="mt-4 space-y-4">
                {primaryFacility?.facility.timezone && (
                  <p className="text-[10px] text-slate-500">
                    Times shown in {primaryFacility.facility.timezone}
                  </p>
                )}
                {availabilityByDay.map(([dayOfWeek, slots]) => (
                  <div key={dayOfWeek}>
                    <p className="text-[10px] font-semibold text-slate-700">
                      {formatDay(dayOfWeek)}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <span
                          key={slot.id}
                          className="rounded-md bg-blue-50 px-2 py-1 text-[9px] text-blue-600"
                        >
                          {formatTime(slot.startTime)} -{" "}
                          {formatTime(slot.endTime)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">
                  Availability not available.
                </p>
              </div>
            )}

            {primaryFacility && (
              <>
                <div className="my-5 border-t border-slate-100" />

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Facility
                  </p>

                  <p className="mt-2 text-xs font-medium text-slate-800">
                    {primaryFacility.facility.name}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {primaryFacility.department.name}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Booking
                  </p>

                  <p className="mt-2 text-[10px] text-slate-500">
                    {primaryFacility.onlineBookingEnabled
                      ? "Online booking is enabled."
                      : "Online booking is currently unavailable."}
                  </p>

                  {primaryFacility.onlineBookingLimit !== null && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      Booking limit: {primaryFacility.onlineBookingLimit}{" "}
                      appointments
                    </p>
                  )}
                </div>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default DoctorProfilePage;
