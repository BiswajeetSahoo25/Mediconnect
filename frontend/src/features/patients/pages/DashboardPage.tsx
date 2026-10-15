import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../../services/api";
import { formatAppointmentStartAt } from "../../appointments/format-appointment-time";
import { getAppointments } from "../../appointments/services/appointment.service";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
} from "../../appointments/types";
import {
  getMedicalDocuments,
  type MedicalDocument,
} from "../services/medical-record.service";

type DashboardData = {
  totalAppointments: number;
  upcomingCount: number;
  upcomingAppointments: Appointment[];
  pastAppointments: number;
  recentAppointments: Appointment[];
  medicalDocuments: MedicalDocument[];
};

const PAST_STATUSES = ["COMPLETED", "CANCELLED", "RESCHEDULED", "NO_SHOW"] as const;

function localDateInTimeZone(timeZone: string, instant: Date) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(instant);
    const part = (type: string) =>
      parts.find((value) => value.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}-${part("day")}`;
  } catch {
    return instant.toISOString().slice(0, 10);
  }
}

function isUpcoming(appointment: Appointment, now: Date) {
  if (appointment.status !== "SCHEDULED") return false;
  if (appointment.appointmentStartAt) {
    const start = new Date(appointment.appointmentStartAt);
    return !Number.isNaN(start.getTime()) && start.getTime() > now.getTime();
  }

  const facilityDate = localDateInTimeZone(
    appointment.doctorFacility.facility.timezone,
    now,
  );
  return appointment.appointmentDate.slice(0, 10) >= facilityDate;
}

function appointmentTimestamp(appointment: Appointment) {
  if (appointment.appointmentStartAt) {
    const start = new Date(appointment.appointmentStartAt).getTime();
    if (!Number.isNaN(start)) return start;
  }
  return new Date(`${appointment.appointmentDate.slice(0, 10)}T00:00:00Z`).getTime();
}

function formatAppointmentDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "Date unavailable";
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(
    "en-IN",
    { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  );
}

async function getAllScheduledAppointments() {
  const pageSize = 50;
  const firstPage = await getAppointments({
    page: 1,
    limit: pageSize,
    status: "SCHEDULED",
  });
  const appointments = [...firstPage.data.items];

  for (let page = 2; page <= firstPage.data.pagination.totalPages; page += 1) {
    const response = await getAppointments({
      page,
      limit: pageSize,
      status: "SCHEDULED",
    });
    appointments.push(...response.data.items);
  }

  return appointments;
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const doctor = appointment.doctorFacility.doctor;
  const doctorName = `Dr. ${doctor.firstName}${doctor.lastName ? ` ${doctor.lastName}` : ""}`;
  const specialty = doctor.specializations[0]?.specialization.name ?? "Specialist";
  const isScheduled = appointment.status === "SCHEDULED";

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700"
        >
          {doctor.firstName.slice(0, 1)}{doctor.lastName?.slice(0, 1) ?? ""}
        </div>
        <div className="min-w-0">
          <Link
            to={`/appointments/${encodeURIComponent(appointment.id)}`}
            className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-700"
          >
            {doctorName}
          </Link>
          <p className="mt-0.5 truncate text-xs text-blue-700">{specialty}</p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {appointment.doctorFacility.facility.name} · {appointment.doctorFacility.department.name}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 sm:justify-end">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {formatAppointmentDate(appointment.appointmentDate)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatAppointmentStartAt(
              appointment.appointmentStartAt,
              appointment.doctorFacility.facility.timezone,
            )}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {APPOINTMENT_TYPE_LABELS[appointment.appointmentType]}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isScheduled
              ? "bg-blue-50 text-blue-700"
              : appointment.status === "COMPLETED"
                ? "bg-emerald-50 text-emerald-700"
                : appointment.status === "CANCELLED"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-100 text-slate-600"
          }`}
        >
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </span>
        <Link
          to={`/appointments/${encodeURIComponent(appointment.id)}`}
          className="text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          Details
        </Link>
      </div>
    </article>
  );
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadDashboard() {
      try {
        const [allResponse, pastResponse, scheduled, medicalDocumentsResponse] = await Promise.all([
            getAppointments({ page: 1, limit: 1 }),
            getAppointments({ page: 1, limit: 4, status: [...PAST_STATUSES] }),
            getAllScheduledAppointments(),
            getMedicalDocuments(),
          ]);

        if (!isCurrent) return;
        const now = new Date();
        const upcoming = scheduled.filter((appointment) => isUpcoming(appointment, now));
        const endedButScheduled = scheduled.filter(
          (appointment) => !isUpcoming(appointment, now),
        );
        const upcomingAppointments = upcoming
          .sort((left, right) => appointmentTimestamp(left) - appointmentTimestamp(right))
          .slice(0, 3);
        const recentAppointments = [
          ...pastResponse.data.items,
          ...endedButScheduled,
        ]
          .sort((left, right) => appointmentTimestamp(right) - appointmentTimestamp(left))
          .slice(0, 4);

        setDashboard({
          totalAppointments: allResponse.data.pagination.total,
          upcomingCount: upcoming.length,
          upcomingAppointments,
          pastAppointments:
            pastResponse.data.pagination.total + endedButScheduled.length,
          recentAppointments,
          medicalDocuments: medicalDocumentsResponse.data,
        });
        setError(null);
      } catch (caught) {
        if (!isCurrent) return;
        setError(
          caught instanceof ApiError
            ? caught.message
            : "We could not load your dashboard. Please try again.",
        );
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void Promise.resolve().then(loadDashboard);
    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl" aria-live="polite">
        <div className="animate-pulse space-y-5">
          <div className="h-36 rounded-3xl bg-white ring-1 ring-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 rounded-2xl bg-white ring-1 ring-slate-200" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-white ring-1 ring-slate-200" />
        </div>
        <span className="sr-only">Loading your appointments and dashboard...</span>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <section className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-6 shadow-sm" role="alert">
        <p className="text-sm font-semibold text-rose-700">Dashboard unavailable</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {error ?? "Your dashboard data could not be loaded."}
        </p>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setRetryCount((count) => count + 1);
          }}
          className="mt-5 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Try again
        </button>
      </section>
    );
  }

  const stats = [
    {
      label: "Total appointments",
      value: dashboard.totalAppointments,
      description: "All bookings on your account",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Upcoming",
      value: dashboard.upcomingCount,
      description: "Your next scheduled visits",
      color: "bg-sky-50 text-sky-700",
    },
    {
      label: "Past appointments",
      value: dashboard.pastAppointments,
      description: "Completed, cancelled, or missed",
      color: "bg-slate-100 text-slate-700",
    },
    {
      label: "Medical records",
      value: dashboard.medicalDocuments.length,
      description: "Documents saved to your account",
      color: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 pb-10">
      <section aria-labelledby="dashboard-overview-heading">
        <div className="mb-4">
          <h2 id="dashboard-overview-heading" className="text-lg font-semibold text-slate-900">Your care overview</h2>
          <p className="mt-1 text-sm text-slate-500">A live summary of your appointment activity.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                </div>
                <span className={`rounded-xl px-3 py-2 text-xs font-semibold ${stat.color}`} aria-hidden="true">●</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{stat.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Upcoming appointments</h2>
              <p className="mt-1 text-sm text-slate-500">Your next scheduled visits.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {dashboard.upcomingCount} upcoming
            </span>
          </div>

          {dashboard.upcomingAppointments.length > 0 ? (
            <div className="mt-5 space-y-3">
              {dashboard.upcomingAppointments.map((appointment) => (
                <AppointmentRow key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <div aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">＋</div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">No upcoming appointments</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                Find a doctor and choose an available time to book your next visit.
              </p>
              <Link to="/doctors" className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
                Find a doctor
              </Link>
            </div>
          )}
          <Link to="/appointments" className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900">
            Manage all appointments <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent appointment activity</h2>
            <p className="mt-1 text-sm text-slate-500">Your latest visit and booking updates.</p>
          </div>
          {dashboard.recentAppointments.length > 0 ? (
            <div className="mt-5 space-y-3">
              {dashboard.recentAppointments.map((appointment) => (
                <AppointmentRow key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <h3 className="text-sm font-semibold text-slate-900">No visit history yet</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                After your first appointment, its status and details will appear here.
              </p>
            </div>
          )}
          <Link to="/appointments" className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900">
            View appointment history <span aria-hidden="true" className="ml-1">→</span>
          </Link>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Medical records</h2>
            <p className="mt-1 text-sm text-slate-500">Your health documents, saved securely with your account.</p>
          </div>
          <Link to="/records" className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
            Add a record
          </Link>
        </div>

        {dashboard.medicalDocuments.length > 0 ? (
          <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100">
            {dashboard.medicalDocuments.slice(0, 3).map((record) => (
              <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M6 3.75h8l4 4v12.5H6z" />
                      <path d="M14 4v4h4M9 13h6M9 16.5h6" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{record.fileName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {record.documentType.replaceAll("_", " ").toLowerCase()} · {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(record.createdAt))}
                    </p>
                  </div>
                </div>
                {record.isVerified && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Verified</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center">
            <p className="text-sm font-semibold text-slate-800">No medical records added yet</p>
            <p className="mt-1 text-sm text-slate-500">Upload a lab report, scan, prescription, or other health document.</p>
          </div>
        )}
        <Link to="/records" className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900">
          View all medical records <span aria-hidden="true" className="ml-1">→</span>
        </Link>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-semibold text-slate-900">Need to change a booking?</p>
          <p className="mt-1 text-sm text-slate-600">Open your appointment list to review details or cancel a scheduled visit.</p>
        </div>
        <Link to="/appointments" className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100">
          Go to appointments
        </Link>
      </section>
    </div>
  );
}

export default DashboardPage;
