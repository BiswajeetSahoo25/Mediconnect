import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDoctorById } from "../services/doctor.service";
import type { Doctor } from "../types/doctor";

const doctorAvatar =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10";
const tabs = [
  "About",
  "Professional Details",
  "Experience",
  "Reviews",
  "Availability",
];

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

        <span>›</span>

        <span>{primarySpecialization?.name ?? "Specialist"}</span>

        <span>›</span>

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
                  ✓ Verified Specialist
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
              {primarySpecialization?.name ?? "Specialist"}
              {primaryFacility?.facilityName
                ? ` · ${primaryFacility.facilityName}`
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
                    ? `₹${primaryFacility.consultationFee}`
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
                to={`/doctors/${doctor.id}`}
                className="rounded-lg bg-[#1a73e8] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Book Appointment
              </Link>

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

              {tab === "Reviews" && (
                <span className="ml-1 text-[10px] text-slate-400">—</span>
              )}
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
                `${doctorName} is a verified ${primarySpecialization?.name ?? "medical specialist"} on MediConnect.`}
            </p>
          </section>

          {/* Professional Details */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Professional Details
            </h2>

            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                  ✓
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                  ✓
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                  🎓
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Specialization
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {primarySpecialization?.name ?? "Not available"}
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                  🏥
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Department
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    {primaryFacility?.departmentName ?? "Not available"}
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600">
                  🩺
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
                    {primaryFacility.facilityName}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {primaryFacility.departmentName}
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
