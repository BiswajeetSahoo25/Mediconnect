import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../../services/api";
import { getSpecializations, type SpecializationOption } from "../../doctors";
import { formatAppointmentStartAt } from "../format-appointment-time";
import { cancelAppointment, getAppointments } from "../index";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
} from "../types";

type AppointmentView = "ALL" | "UPCOMING" | "PAST" | "CANCELLED";

const APPOINTMENT_VIEWS: Array<{ id: AppointmentView; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "UPCOMING", label: "Upcoming" },
  { id: "PAST", label: "Past / completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

const STATUS_BADGE_CLASSES: Record<Appointment["status"], string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
  RESCHEDULED: "bg-amber-50 text-amber-700",
  NO_SHOW: "bg-slate-100 text-slate-600",
};

function formatAppointmentDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 12)).toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  );
}

function localDateInTimeZone(timeZone: string, instant = new Date()) {
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

function isUpcoming(appointment: Appointment, now = new Date()) {
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

function dateOffsetFromToday(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatFee(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount)
    : "Not provided";
}

function AppointmentCard({
  appointment,
  onCancel,
  cancelling,
}: {
  appointment: Appointment;
  onCancel: (appointment: Appointment) => void;
  cancelling: boolean;
}) {
  const { doctorFacility } = appointment;
  const doctor = doctorFacility.doctor;
  const primarySpecialization =
    doctor.specializations.find((item) => item.specialization)?.specialization
      .name ?? "Specialist";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to={`/appointments/${encodeURIComponent(appointment.id)}`}
            className="text-sm font-semibold text-slate-900 hover:text-blue-700"
          >
            Dr. {doctor.firstName}
            {doctor.lastName ? ` ${doctor.lastName}` : ""}
          </Link>
          <p className="mt-0.5 text-xs text-blue-600">{primarySpecialization}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {doctorFacility.facility.name} · {doctorFacility.department.name}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_BADGE_CLASSES[appointment.status]}`}
        >
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">Date</dt>
          <dd className="mt-1 text-slate-800">
            {formatAppointmentDate(appointment.appointmentDate)}
          </dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">Time</dt>
          <dd className="mt-1 text-slate-800">
            {formatAppointmentStartAt(
              appointment.appointmentStartAt,
              doctorFacility.facility.timezone,
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">Queue no.</dt>
          <dd className="mt-1 text-slate-800">#{appointment.queueNumber}</dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">Type · mode</dt>
          <dd className="mt-1 text-slate-800">
            {APPOINTMENT_TYPE_LABELS[appointment.appointmentType]} · {appointment.appointmentModel.replaceAll("_", " ").toLowerCase()}
          </dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">Fee</dt>
          <dd className="mt-1 text-slate-800">{formatFee(doctorFacility.consultationFee)}</dd>
        </div>
      </dl>

      {appointment.reason && (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Reason: {appointment.reason}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Link
          to={`/appointments/${encodeURIComponent(appointment.id)}`}
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Appointment details
        </Link>
        {appointment.status === "SCHEDULED" && (
          <button
            type="button"
            disabled={cancelling}
            onClick={() => onCancel(appointment)}
            className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel appointment"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [specializationsLoading, setSpecializationsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<AppointmentView>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancellationTarget, setCancellationTarget] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setError(null);
    try {
      const response = await getAppointments({
        page,
        limit: 20,
        ...(view === "UPCOMING"
          ? { status: "SCHEDULED" as const, from: dateOffsetFromToday(-1) }
          : view === "PAST"
            ? { status: ["COMPLETED", "NO_SHOW", "RESCHEDULED"] as const }
            : view === "CANCELLED"
              ? { status: "CANCELLED" as const }
              : {}),
      });

      setAppointments(
        view === "UPCOMING"
          ? response.data.items.filter((appointment) => isUpcoming(appointment))
          : response.data.items,
      );
      setPagination({
        page: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total,
      });
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Failed to load your appointments.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, view]);

  useEffect(() => {
    void Promise.resolve().then(fetchAppointments);
  }, [fetchAppointments]);

  useEffect(() => {
    let active = true;
    getSpecializations()
      .then((response) => {
        if (active) setSpecializations(response.data);
      })
      .catch(() => {
        if (active) setSpecializations([]);
      })
      .finally(() => {
        if (active) setSpecializationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function findSpecialist() {
    const selected = specializations.find((item) => item.id === selectedSpecialization);
    navigate(selected ? `/doctors?specialty=${encodeURIComponent(selected.name)}` : "/doctors");
  }

  async function handleCancel() {
    if (!cancellationTarget || !cancellationReason.trim()) return;
    try {
      setCancellingId(cancellationTarget.id);
      setActionError(null);
      setActionSuccess(null);
      await cancelAppointment(cancellationTarget.id, cancellationReason.trim());
      setCancellationTarget(null);
      setCancellationReason("");
      setActionSuccess("Appointment cancelled successfully.");
      setLoading(true);
      await fetchAppointments();
    } catch (caught) {
      setActionError(
        caught instanceof ApiError ? caught.message : "Failed to cancel the appointment.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  const activeViewLabel = APPOINTMENT_VIEWS.find((option) => option.id === view)?.label;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My appointments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review scheduled visits, appointment history, and cancellations.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <label htmlFor="appointment-specialty-search" className="sr-only">Choose a specialty to find a doctor</label>
          <select id="appointment-specialty-search" value={selectedSpecialization} onChange={(event) => setSelectedSpecialization(event.target.value)} disabled={specializationsLoading || specializations.length === 0} className="min-w-52 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100">
            <option value="">Any specialty</option>
            {specializations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button type="button" onClick={findSpecialist} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">Find a doctor</button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Appointment views">
        {APPOINTMENT_VIEWS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={view === option.id}
            onClick={() => {
              if (view === option.id) return;
              setLoading(true);
              setError(null);
              setPage(1);
              setView(option.id);
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${view === option.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {actionSuccess && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
          {actionSuccess}
        </div>
      )}

      {loading && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading your appointments...
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void fetchAppointments();
            }}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && appointments.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">No appointments found</h2>
          <p className="mt-2 text-sm text-slate-500">
            {view === "ALL"
              ? "You have not booked any appointments yet."
              : `You have no ${activeViewLabel?.toLowerCase()} appointments.`}
          </p>
          <Link
            to="/doctors"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Find a doctor
          </Link>
        </div>
      )}

      {!loading && !error && appointments.length > 0 && (
        <div className="mt-6 space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={(target) => {
                setCancellationTarget(target);
                setCancellationReason("");
                setActionError(null);
                setActionSuccess(null);
              }}
              cancelling={cancellingId === appointment.id}
            />
          ))}
        </div>
      )}

      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={pagination.page === 1}
            onClick={() => {
              setLoading(true);
              setPage((current) => Math.max(1, current - 1));
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} appointments
          </span>
          <button
            type="button"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => {
              setLoading(true);
              setPage((current) => Math.min(pagination.totalPages, current + 1));
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {cancellationTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !cancellingId) {
              setCancellationTarget(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-appointment-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 id="cancel-appointment-title" className="text-lg font-semibold text-slate-900">
              Cancel this appointment?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Cancelling releases the scheduled slot. Enter a reason to confirm.
            </p>
            <label htmlFor="cancellation-reason" className="mt-4 block text-sm font-medium text-slate-700">
              Cancellation reason
            </label>
            <textarea
              id="cancellation-reason"
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              maxLength={2000}
              rows={3}
              autoFocus
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {actionError && <p className="mt-2 text-sm text-red-600" role="alert">{actionError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={Boolean(cancellingId)}
                onClick={() => setCancellationTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 disabled:opacity-50"
              >
                Keep appointment
              </button>
              <button
                type="button"
                disabled={Boolean(cancellingId) || !cancellationReason.trim()}
                onClick={() => void handleCancel()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancellingId ? "Cancelling..." : "Confirm cancellation"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
