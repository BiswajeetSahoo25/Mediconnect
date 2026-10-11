import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createAppointment, getAppointmentAvailability } from "../index";
import { getDoctorById } from "../../doctors";
import { ApiError } from "../../../services/api";
import {
  APPOINTMENT_MODELS,
  APPOINTMENT_MODEL_LABELS,
  APPOINTMENT_TYPES,
  APPOINTMENT_TYPE_LABELS,
  type AppointmentModel,
  type AppointmentType,
  type BookingDoctorContext,
} from "../types";
import type { Doctor } from "../../doctors/types";

type Step = "details" | "slots" | "confirm" | "success";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatDateLabel(dateKey: string) {
  // Supports both YYYY-MM-DD and ISO timestamps.
  const datePart = dateKey.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return "Invalid date";
  }

  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    },
  );
}

function formatAppointmentTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(value));
}

function toDoctorContext(doctor: Doctor): BookingDoctorContext {
  const primarySpecialization =
    doctor.specializations.find((specialization) => specialization.isPrimary) ??
    doctor.specializations[0];

  return {
    doctorId: doctor.id,
    doctorName: `Dr. ${doctor.firstName}${doctor.lastName ? ` ${doctor.lastName}` : ""}`,
    specialization: primarySpecialization?.specialization?.name ?? null,

    facilities: doctor.facilities.map((facility) => ({
      id: facility.id,
      facilityName: facility.facility.name,
      facilityType: "Healthcare facility",
      departmentName: facility.department.name,
      consultationFee: facility.consultationFee,
      consultationMode: facility.consultationMode,
      onlineBookingEnabled: facility.onlineBookingEnabled,
    })),
  };
}

function BookAppointmentPage() {
  const { id } = useParams<{ id: string }>();

  const [doctor, setDoctor] = useState<BookingDoctorContext | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [appointmentType, setAppointmentType] =
    useState<AppointmentType>("CONSULTATION");
  const [appointmentModel, setAppointmentModel] =
    useState<AppointmentModel>("IN_PERSON");
  const [reason, setReason] = useState("");

  const [availability, setAvailability] = useState<Awaited<
    ReturnType<typeof getAppointmentAvailability>
  > | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [availabilityRefreshCount, setAvailabilityRefreshCount] = useState(0);
  const [availabilityNotice, setAvailabilityNotice] = useState<string | null>(null);

  const [dateKey, setDateKey] = useState("");
  const [selectedSlotStartAt, setSelectedSlotStartAt] = useState("");

  const [step, setStep] = useState<Step>("details");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booked, setBooked] = useState<{
    id: string;
    queueNumber: number;
    date: string;
    startAt: string;
    timezone: string;
  } | null>(null);

  const bookableFacilities = useMemo(() => {
    return (
      doctor?.facilities.filter((facility) => facility.onlineBookingEnabled) ??
      []
    );
  }, [doctor]);

  const selectedFacility = useMemo(() => {
    return bookableFacilities.find(
      (facility) => facility.id === selectedFacilityId,
    );
  }, [bookableFacilities, selectedFacilityId]);

  const availableModels = useMemo(() => {
    if (!selectedFacility) return [...APPOINTMENT_MODELS];
    if (selectedFacility?.consultationMode === "ONLINE") {
      return APPOINTMENT_MODELS.filter((model) => model !== "IN_PERSON");
    }
    if (
      selectedFacility?.consultationMode === "IN_PERSON" ||
      selectedFacility?.consultationMode === "OFFLINE"
    ) {
      return APPOINTMENT_MODELS.filter((model) => model === "IN_PERSON");
    }
    if (selectedFacility.consultationMode === "BOTH") {
      return [...APPOINTMENT_MODELS];
    }
    return [];
  }, [selectedFacility]);

  const effectiveAppointmentModel = availableModels.includes(appointmentModel)
    ? appointmentModel
    : availableModels[0];

  const selectedDate = useMemo(() => {
    return availability?.data.dates.find((entry) => entry.date === dateKey);
  }, [availability, dateKey]);

  const selectedSlot = useMemo(
    () => selectedDate?.slots.find((slot) => slot.startAt === selectedSlotStartAt),
    [selectedDate, selectedSlotStartAt],
  );

  useEffect(() => {
    async function fetchDoctor() {
      if (!id) {
        setLoadError("Doctor ID is missing.");
        setLoadingDoctor(false);
        return;
      }

      try {
        setLoadingDoctor(true);
        setLoadError(null);

        const response = await getDoctorById(id);
        const context = toDoctorContext(response.data);

        setDoctor(context);

        const firstBookable = context.facilities.find(
          (facility) => facility.onlineBookingEnabled,
        );

        setSelectedFacilityId(firstBookable?.id ?? "");
      } catch (error) {
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "Failed to load doctor details.",
        );
      } finally {
        setLoadingDoctor(false);
      }
    }

    fetchDoctor();
  }, [id]);

  useEffect(() => {
    let active = true;
    if (!selectedFacilityId) return;

    async function fetchAvailability() {
      try {
        setLoadingAvailability(true);
        setAvailabilityError(null);
        const result = await getAppointmentAvailability(selectedFacilityId);
        if (!active) return;
        setAvailability(result);
        if (result.data.onlineBookingEnabled && result.data.dates.length === 0) {
          setAvailabilityError(
            "No bookable dates in the next 7 days. The doctor may be on leave, closed, or fully booked.",
          );
        }
      } catch (error) {
        if (!active) return;
        setAvailability(null);
        setAvailabilityError(
          error instanceof ApiError
            ? error.message
            : "Failed to check availability.",
        );
      } finally {
        if (active) setLoadingAvailability(false);
      }
    }

    void fetchAvailability();
    return () => {
      active = false;
    };
  }, [selectedFacilityId, availabilityRefreshCount]);

  async function handleConfirm() {
    if (
      !selectedFacilityId ||
      !selectedSlot ||
      !effectiveAppointmentModel ||
      submitting
    ) return;

    try {
      setSubmitting(true);
      setSubmitError(null);

      const result = await createAppointment({
        doctorFacilityId: selectedFacilityId,
        appointmentType,
        appointmentModel: effectiveAppointmentModel,
        appointmentStartAt: selectedSlot.startAt,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });

      setBooked({
        id: result.data.id,
        queueNumber: result.data.queueNumber,
        date: result.data.appointmentDate,
        startAt: result.data.appointmentStartAt ?? "",
        timezone: result.data.doctorFacility.facility.timezone,
      });
      setStep("success");
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 409) {
        setSubmitError(null);
        setStep("slots");
        setSelectedSlotStartAt("");
        setAvailabilityNotice("That slot was just booked. Availability has been refreshed.");
        setAvailabilityRefreshCount((count) => count + 1);
        return;
      }

      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Failed to create the appointment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingDoctor) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-8 py-6 text-sm text-slate-600 shadow-sm">
          Loading booking details...
        </div>
      </div>
    );
  }

  if (loadError || !doctor) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-red-600">
          {loadError ?? "Doctor not found."}
        </p>

        <Link
          to="/doctors"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Back to Doctors
        </Link>
      </div>
    );
  }

  if (step === "success" && booked) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
          ✓
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Appointment confirmed
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {doctor.doctorName} · {selectedFacility?.facilityName ?? ""} ·{" "}
          {formatDateLabel(booked.date.slice(0, 10))}
        </p>

        {booked.startAt && (
          <p className="mt-1 text-sm font-medium text-slate-800">
            {formatAppointmentTime(booked.startAt, booked.timezone)}
          </p>
        )}

        <p className="mt-1 text-sm font-medium text-slate-800">
          Queue number #{booked.queueNumber}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/appointments"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            View my appointments
          </Link>

          <Link
            to="/doctors"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Book another
          </Link>
        </div>
      </div>
    );
  }

  const steps = ["details", "slots", "confirm"] as const;
  const currentStepIndex = steps.indexOf(step === "success" ? "confirm" : step);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
        <Link to="/doctors" className="text-blue-600 hover:underline">
          Find Doctors
        </Link>

        <span>›</span>

        <Link
          to={`/doctors/${doctor.doctorId}`}
          className="text-blue-600 hover:underline"
        >
          {doctor.doctorName}
        </Link>

        <span>›</span>

        <span className="text-slate-700">Book Appointment</span>
      </div>

      {/* Doctor summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          Book an appointment with {doctor.doctorName}
        </h1>

        <p className="mt-1 text-sm text-blue-600">
          {doctor.specialization ?? "Specialist"}
        </p>
      </section>

      {/* Progress */}
      <ol className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium">
        {steps.map((item, index) => (
          <li
            key={item}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
              index === currentStepIndex
                ? "bg-blue-600 text-white"
                : index < currentStepIndex
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            <span>{index + 1}</span>

            <span>
              {item === "details"
                ? "Facility & timing"
                : item === "slots"
                  ? "Date & slot"
                  : "Confirm"}
            </span>
          </li>
        ))}
      </ol>

      {step === "details" && (
        <section className="mt-4 space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {/* Facility */}
          <div>
            <label
              htmlFor="facility"
              className="block text-sm font-medium text-slate-700"
            >
              Facility
            </label>

            <select
              id="facility"
              value={selectedFacilityId}
              onChange={(event) => {
                setSelectedFacilityId(event.target.value);
                setDateKey("");
                setSelectedSlotStartAt("");
                setAvailabilityNotice(null);
              }}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              {bookableFacilities.length === 0 && (
                <option value="">No bookable facilities</option>
              )}

              {bookableFacilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.facilityName} · {facility.departmentName} · ₹
                  {facility.consultationFee}
                </option>
              ))}
            </select>

            {selectedFacility && (
              <p className="mt-1.5 text-[11px] text-slate-500">
                {selectedFacility.facilityType} facility · consultation mode:{" "}
                {selectedFacility.consultationMode}
              </p>
            )}
          </div>

          {/* Appointment type */}
          <div>
            <p className="text-sm font-medium text-slate-700">
              Appointment type
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {APPOINTMENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAppointmentType(type)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    appointmentType === type
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {APPOINTMENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Appointment model */}
          <div>
            <p className="text-sm font-medium text-slate-700">
              Consultation mode
            </p>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {availableModels.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setAppointmentModel(model)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    effectiveAppointmentModel === model
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {APPOINTMENT_MODEL_LABELS[model]}
                </button>
              ))}
            </div>

            {selectedFacility?.consultationMode === "ONLINE" && (
              <p className="mt-1.5 text-[11px] text-amber-600">
                This doctor consults online only at this facility.
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-slate-700"
            >
              Reason for visit (optional)
            </label>

            <textarea
              id="reason"
              rows={2}
              maxLength={2000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Briefly describe the purpose of this visit"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!selectedFacilityId || availableModels.length === 0}
              onClick={() => setStep("slots")}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Check available slots →
            </button>
          </div>
        </section>
      )}

      {step === "slots" && (
        <section className="mt-4 space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Available dates & slots
            </h2>

            <button
              type="button"
              onClick={() => setStep("details")}
              className="text-xs text-blue-600 hover:underline"
            >
              ← Change details
            </button>
          </div>

          {loadingAvailability && (
            <div className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Checking the doctor's real schedule...
            </div>
          )}

          {!loadingAvailability && availabilityError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {availabilityError}
              <button
                type="button"
                onClick={() => setAvailabilityRefreshCount((count) => count + 1)}
                className="ml-3 font-semibold underline"
              >
                Refresh
              </button>
            </div>
          )}

          {!loadingAvailability && availabilityNotice && (
            <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {availabilityNotice}
            </div>
          )}

          {!loadingAvailability &&
            availability &&
            availability.data.dates.length > 0 && (
              <>
                <p className="text-[11px] text-slate-500">
                  Showing the next 7 bookable days, excluding leaves, closed
                  days and fully booked days (verified against the doctor's
                  schedule).
                </p>

                {/* Dates */}
                <div className="flex flex-wrap gap-2">
                  {availability.data.dates.map((entry) => {
                    const dayOfWeek = new Date(
                      `${entry.date}T12:00:00Z`,
                    ).getUTCDay();

                    return (
                      <button
                        key={entry.date}
                        type="button"
                        onClick={() => {
                          setDateKey(entry.date);
                          setSelectedSlotStartAt("");
                          setAvailabilityNotice(null);
                        }}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                          dateKey === entry.date
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-300 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {formatDateLabel(entry.date)}

                        <span className="ml-1.5 text-[10px] text-slate-400">
                          {DAY_NAMES[dayOfWeek]}
                        </span>

                        {entry.remainingBookings !== null && (
                          <span className="ml-1.5 text-[10px] text-amber-600">
                            {entry.remainingBookings} left
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Available starts for selected date */}
                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Available start times for {formatDateLabel(selectedDate.date)}
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {selectedDate.slots.map((slot) => (
                        <button
                          key={slot.startAt}
                          type="button"
                          onClick={() => {
                            setSelectedSlotStartAt(slot.startAt);
                            setAvailabilityNotice(null);
                          }}
                          className={`rounded-lg border px-4 py-2.5 text-left text-xs font-medium transition ${
                            selectedSlotStartAt === slot.startAt
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-300 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {formatAppointmentTime(slot.startAt, availability.data.timezone)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!dateKey || !selectedSlotStartAt || loadingAvailability}
              onClick={() => setStep("confirm")}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to confirm →
            </button>
          </div>
        </section>
      )}

      {step === "confirm" && (
        <section className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Confirm your appointment
          </h2>

          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Doctor
              </dt>

              <dd className="mt-1 text-slate-800">{doctor.doctorName}</dd>
            </div>

            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Facility
              </dt>

              <dd className="mt-1 text-slate-800">
                {selectedFacility
                  ? `${selectedFacility.facilityName} · ${selectedFacility.departmentName}`
                  : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Date
              </dt>

              <dd className="mt-1 text-slate-800">
                {dateKey ? formatDateLabel(dateKey) : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Appointment time
              </dt>

              <dd className="mt-1 text-slate-800">
                {selectedSlot && availability
                  ? formatAppointmentTime(
                      selectedSlot.startAt,
                      availability.data.timezone,
                    )
                  : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Type
              </dt>

              <dd className="mt-1 text-slate-800">
                {APPOINTMENT_TYPE_LABELS[appointmentType]}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Mode
              </dt>

              <dd className="mt-1 text-slate-800">
                {effectiveAppointmentModel
                  ? APPOINTMENT_MODEL_LABELS[effectiveAppointmentModel]
                  : "Unavailable"}
              </dd>
            </div>

            {reason.trim() && (
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Reason
                </dt>

                <dd className="mt-1 text-slate-800">{reason.trim()}</dd>
              </div>
            )}
          </dl>

          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("slots")}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to slots
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Booking..." : "Confirm appointment"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default BookAppointmentPage;
