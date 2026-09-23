import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  cancelAppointment,
  getAppointments,
} from "../index";
import { ApiError } from "../../../services/api";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
  type AppointmentStatus,
} from "../types";

const STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
  RESCHEDULED: "bg-amber-50 text-amber-700",
  NO_SHOW: "bg-slate-100 text-slate-600",
};

function formatAppointmentDate(value: string) {
  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 12)).toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function AppointmentCard({
  appointment,
  onCancel,
  cancelling,
}: {
  appointment: Appointment;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  const { doctorFacility } = appointment;
  const doctor = doctorFacility.doctor;
  const primarySpecialization =
    doctor.specializations.find((item) => item.specialization) ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {doctor.firstName}
            {doctor.lastName ? ` ${doctor.lastName}` : ""}
          </p>

          <p className="mt-0.5 text-xs text-blue-600">
            {primarySpecialization?.specialization.name ?? "Specialist"}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {doctorFacility.facility.name} · {doctorFacility.department.name}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
            STATUS_BADGE_CLASSES[appointment.status]
          }`}
        >
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">
            Date
          </dt>

          <dd className="mt-1 text-slate-800">
            {formatAppointmentDate(appointment.appointmentDate)}
          </dd>
        </div>

        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">
            Queue no.
          </dt>

          <dd className="mt-1 text-slate-800">#{appointment.queueNumber}</dd>
        </div>

        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">
            Type
          </dt>

          <dd className="mt-1 text-slate-800">
            {APPOINTMENT_TYPE_LABELS[appointment.appointmentType]}
          </dd>
        </div>

        <div>
          <dt className="font-medium uppercase tracking-wide text-slate-400">
            Mode
          </dt>

          <dd className="mt-1 text-slate-800">
            {appointment.appointmentModel.replace("_", " ").toLowerCase()}
          </dd>
        </div>
      </dl>

      {appointment.reason && (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Reason: {appointment.reason}
        </p>
      )}

      {appointment.status === "SCHEDULED" && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={cancelling}
            onClick={() => onCancel(appointment.id)}
            className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel appointment"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [status, setStatus] = useState<"ALL" | AppointmentStatus>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAppointments({
        page,
        limit: 10,
        ...(status !== "ALL" ? { status } : {}),
      });

      setAppointments(response.data.items);
      setPagination({
        page: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total,
      });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Failed to load your appointments.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  async function handleCancel(id: string) {
    const reason = window.prompt(
      "Please enter a short reason for cancelling this appointment:",
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      setActionError("A cancellation reason is required.");
      return;
    }

    try {
      setCancellingId(id);
      setActionError(null);

      await cancelAppointment(id, reason.trim());

      await fetchAppointments();
    } catch (caught) {
      setActionError(
        caught instanceof ApiError
          ? caught.message
          : "Failed to cancel the appointment.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            My appointments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Upcoming and past appointments booked through MediConnect.
          </p>
        </div>

        <Link
          to="/doctors"
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Book new appointment
        </Link>
      </div>

      {/* Status filter */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["ALL", ...APPOINTMENT_STATUSES] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              status === option
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {option === "ALL" ? "All" : APPOINTMENT_STATUS_LABELS[option]}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading your appointments...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={fetchAppointments}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && appointments.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No appointments found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {status === "ALL"
              ? "You haven't booked any appointments yet."
              : `You have no ${APPOINTMENT_STATUS_LABELS[status].toLowerCase()} appointments.`}
          </p>

          <Link
            to="/doctors"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Find a doctor
          </Link>
        </div>
      )}

      {/* List */}
      {!loading && !error && appointments.length > 0 && (
        <div className="mt-6 space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancel}
              cancelling={cancellingId === appointment.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading &&
        !error &&
        pagination &&
        pagination.totalPages > 1 &&
        appointments.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={pagination.page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-3 text-sm text-slate-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.totalPages, current + 1),
                )
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}
