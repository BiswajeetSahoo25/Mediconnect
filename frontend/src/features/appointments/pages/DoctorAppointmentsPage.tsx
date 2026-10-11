import { useEffect, useState } from "react";
import { ApiError } from "../../../services/api";
import { formatAppointmentStartAt } from "../format-appointment-time";
import { getDoctorAppointments } from "../services/appointment.service";
import {
  APPOINTMENT_MODEL_LABELS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
  type AppointmentStatus,
} from "../types";

type AppointmentFilter = "ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED";

const filters: Array<{ label: string; value: AppointmentFilter }> = [
  { label: "All", value: "ALL" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const statusClasses: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  RESCHEDULED: "bg-amber-50 text-amber-700",
  NO_SHOW: "bg-slate-100 text-slate-700",
};

function getTodayDate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Date unavailable";
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 12));

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAppointmentQuery(filter: AppointmentFilter, page: number) {
  if (filter === "UPCOMING") {
    return {
      page,
      limit: 10,
      status: "SCHEDULED" as const,
      from: getTodayDate(),
    };
  }

  if (filter === "COMPLETED" || filter === "CANCELLED") {
    return { page, limit: 10, status: filter };
  }

  return { page, limit: 10 };
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const facility = appointment.doctorFacility?.facility;
  const department = appointment.doctorFacility?.department;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">
            {APPOINTMENT_TYPE_LABELS[appointment.appointmentType] ??
              "Appointment"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {formatDate(appointment.appointmentDate)}
            {appointment.queueNumber != null && (
              <span> · Queue #{appointment.queueNumber}</span>
            )}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {formatAppointmentStartAt(
              appointment.appointmentStartAt,
              facility?.timezone ?? "UTC",
            )}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            statusClasses[appointment.status] ?? "bg-slate-100 text-slate-700"
          }`}
        >
          {APPOINTMENT_STATUS_LABELS[appointment.status] ??
            appointment.status}
        </span>
      </div>

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Facility
          </dt>
          <dd className="mt-1 text-slate-800">
            {facility?.name || "Not available"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Department
          </dt>
          <dd className="mt-1 text-slate-800">
            {department?.name || "Not available"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Appointment mode
          </dt>
          <dd className="mt-1 text-slate-800">
            {APPOINTMENT_MODEL_LABELS[appointment.appointmentModel] ??
              appointment.appointmentModel}
          </dd>
        </div>
        {appointment.patientId && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Patient reference
            </dt>
            <dd className="mt-1 break-all text-slate-800">
              {appointment.patientId}
            </dd>
          </div>
        )}
      </dl>

      {appointment.reason && (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Reason for visit
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
            {appointment.reason}
          </p>
        </div>
      )}
      {appointment.patientNotes && (
        <div className="mt-3 rounded-xl bg-blue-50/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Patient notes
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
            {appointment.patientNotes}
          </p>
        </div>
      )}
    </article>
  );
}

function DoctorAppointmentsPage() {
  const [filter, setFilter] = useState<AppointmentFilter>("ALL");
  const [page, setPage] = useState(1);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
    total: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const visibleAppointments = appointments.filter((appointment) => {
    if (filter === "COMPLETED") return appointment.status === "COMPLETED";
    if (filter === "CANCELLED") return appointment.status === "CANCELLED";
    if (filter === "UPCOMING") {
      const appointmentDate = appointment.appointmentDate?.split("T")[0];
      return (
        appointment.status === "SCHEDULED" &&
        Boolean(appointmentDate && appointmentDate >= getTodayDate())
      );
    }
    return true;
  });

  useEffect(() => {
    let isCurrent = true;

    getDoctorAppointments(getAppointmentQuery(filter, page))
      .then((response) => {
        if (!isCurrent) return;
        setAppointments(response.data.items);
        setPagination(response.data.pagination);
        setError(null);
      })
      .catch((caughtError: unknown) => {
        if (!isCurrent) return;
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Could not load doctor appointments.",
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [filter, page, retryCount]);

  function selectFilter(nextFilter: AppointmentFilter) {
    if (nextFilter === filter) return;
    setIsLoading(true);
    setError(null);
    setFilter(nextFilter);
    setPage(1);
  }

  function retry() {
    setIsLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  }

  function changePage(nextPage: number) {
    setIsLoading(true);
    setError(null);
    setPage(nextPage);
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header>
        <p className="text-sm font-medium text-teal-700">Doctor workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Appointments
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Review appointments assigned to your professional profile.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2" aria-label="Filter appointments">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => selectFilter(item.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === item.value
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!isLoading && pagination && !error && (
        <p className="mt-4 text-sm text-slate-500">
          {pagination.total} {pagination.total === 1 ? "appointment" : "appointments"}
        </p>
      )}

      {isLoading && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600" aria-live="polite">
          Loading appointments...
        </div>
      )}

      {!isLoading && error && (
        <section className="mt-5 rounded-2xl border border-rose-200 bg-white p-8 text-center">
          <h2 className="font-semibold text-slate-900">
            Appointments unavailable
          </h2>
          <p className="mt-2 text-sm text-rose-700">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Try again
          </button>
        </section>
      )}

      {!isLoading && !error && visibleAppointments.length === 0 && (
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="font-semibold text-slate-900">
            No {filter === "ALL" ? "appointments" : filter.toLowerCase() + " appointments"} found
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {filter === "ALL"
              ? "Appointments assigned to you will appear here."
              : "Try another filter to see more appointments."}
          </p>
        </section>
      )}

      {!isLoading && !error && visibleAppointments.length > 0 && (
        <div className="mt-5 space-y-4">
          {visibleAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}

      {!isLoading && !error && pagination && pagination.totalPages > 1 && (
        <nav
          aria-label="Appointment pages"
          className="mt-7 flex items-center justify-center gap-3"
        >
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => changePage(Math.max(1, page - 1))}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => changePage(Math.min(pagination.totalPages, page + 1))}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

export default DoctorAppointmentsPage;
