import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../../services/api";
import { formatAppointmentStartAt } from "../format-appointment-time";
import { getAppointmentById } from "../services/appointment.service";
import {
  APPOINTMENT_MODEL_LABELS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
} from "../types";

function formatAppointmentDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 12)).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  );
}

function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointment = useCallback(async () => {
    if (!id) {
      setError("Appointment not found.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getAppointmentById(id);
      setAppointment(response.data);
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Could not load appointment details.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(loadAppointment);
  }, [loadAppointment]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link to="/appointments" className="text-sm font-medium text-blue-700 hover:text-blue-800">
        ← Back to appointments
      </Link>

      {loading && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Loading appointment details...
        </div>
      )}

      {!loading && error && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-red-600" role="alert">{error}</p>
          <button
            type="button"
            onClick={() => void loadAppointment()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && appointment && (
        <article className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Appointment details
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                {APPOINTMENT_TYPE_LABELS[appointment.appointmentType]}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Booked {formatAppointmentDate(appointment.appointmentDate)}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </span>
          </div>

          <section className="mt-7 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-900">Provider</h2>
            <Link
              to={`/doctors/${encodeURIComponent(appointment.doctorFacility.doctor.id)}`}
              className="mt-2 inline-block text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Dr. {appointment.doctorFacility.doctor.firstName}
              {appointment.doctorFacility.doctor.lastName
                ? ` ${appointment.doctorFacility.doctor.lastName}`
                : ""}
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              {appointment.doctorFacility.doctor.specializations
                .map((item) => item.specialization?.name)
                .filter(Boolean)
                .join(", ") || "Specialist"}
            </p>
          </section>

          <section className="mt-6 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-900">Visit</h2>
            <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Date</dt>
                <dd className="mt-1 text-slate-800">
                  {formatAppointmentDate(appointment.appointmentDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Time</dt>
                <dd className="mt-1 text-slate-800">
                  {formatAppointmentStartAt(
                    appointment.appointmentStartAt,
                    appointment.doctorFacility.facility.timezone,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Facility</dt>
                <dd className="mt-1 text-slate-800">
                  {appointment.doctorFacility.facility.name} · {appointment.doctorFacility.department.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Consultation mode</dt>
                <dd className="mt-1 text-slate-800">
                  {APPOINTMENT_MODEL_LABELS[appointment.appointmentModel]}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Queue number</dt>
                <dd className="mt-1 text-slate-800">#{appointment.queueNumber}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Consultation fee</dt>
                <dd className="mt-1 text-slate-800">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(Number(appointment.doctorFacility.consultationFee))}
                </dd>
              </div>
            </dl>
          </section>

          {appointment.reason && (
            <section className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold text-slate-900">Reason provided</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{appointment.reason}</p>
            </section>
          )}

          {appointment.cancellationReason && (
            <section className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold text-slate-900">Cancellation reason</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                {appointment.cancellationReason}
              </p>
            </section>
          )}
        </article>
      )}
    </div>
  );
}

export default AppointmentDetailPage;
