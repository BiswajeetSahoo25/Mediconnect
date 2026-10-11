import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../../services/api";
import {
  addMyDoctorPracticeFacility,
  getDoctorById,
  getMyDoctorPractice,
  getMyDoctorProfile,
  getSpecializations,
  updateMyDoctorPracticeFacility,
  updateMyDoctorProfile,
  updateMyDoctorSpecializations,
  type CreateDoctorPracticeFacilityInput,
  type SpecializationOption,
} from "../services/doctor.service";
import type {
  Doctor,
  DoctorPracticeFacility,
  DoctorPracticeWindowInput,
  MyDoctorPractice,
  MyDoctorProfile,
} from "../types";

type ProfileDraft = {
  firstName: string;
  lastName: string;
  yearsOfExperience: string;
  about: string;
};

const emptyDraft: ProfileDraft = {
  firstName: "",
  lastName: "",
  yearsOfExperience: "",
  about: "",
};

type PracticeFacilityDraft = {
  facilityId: string;
  departmentId: string;
  consultationFee: string;
  consultationMode: CreateDoctorPracticeFacilityInput["consultationMode"] | "";
  onlineBookingEnabled: boolean;
  onlineBookingLimit: string;
  availability: DoctorPracticeWindowInput[];
};

const emptyPracticeFacilityDraft: PracticeFacilityDraft = {
  facilityId: "",
  departmentId: "",
  consultationFee: "",
  consultationMode: "",
  onlineBookingEnabled: false,
  onlineBookingLimit: "",
  availability: [],
};

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toTimeInputValue(value: string) {
  return value.includes("T") ? value.slice(11, 16) : value.slice(0, 5);
}

function toPracticeDraft(assignment: DoctorPracticeFacility): PracticeFacilityDraft {
  return {
    facilityId: assignment.facilityId,
    departmentId: assignment.departmentId,
    consultationFee: assignment.consultationFee,
    consultationMode: assignment.consultationMode as PracticeFacilityDraft["consultationMode"],
    onlineBookingEnabled: assignment.onlineBookingEnabled,
    onlineBookingLimit: assignment.onlineBookingLimit?.toString() ?? "",
    availability: assignment.availability.map((window) => ({
      dayOfWeek: window.dayOfWeek,
      startTime: toTimeInputValue(window.startTime),
      endTime: toTimeInputValue(window.endTime),
    })),
  };
}

function AvailabilityEditor({
  windows,
  onChange,
}: {
  windows: DoctorPracticeWindowInput[];
  onChange: (windows: DoctorPracticeWindowInput[]) => void;
}) {
  return (
    <div className="space-y-3">
      {windows.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
          No weekly hours added. Appointment slots won’t be available until you add hours.
        </p>
      )}
      {windows.map((window, index) => (
        <div key={index} className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <label className="text-xs font-semibold text-slate-600">
            Day
            <select
              value={window.dayOfWeek}
              onChange={(event) => onChange(windows.map((item, itemIndex) => itemIndex === index ? { ...item, dayOfWeek: Number(event.target.value) } : item))}
              className="mt-1 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800"
            >
              {weekDays.map((day, dayIndex) => <option key={dayIndex} value={dayIndex}>{day}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Opens
            <input
              type="time"
              value={window.startTime}
              onChange={(event) => onChange(windows.map((item, itemIndex) => itemIndex === index ? { ...item, startTime: event.target.value } : item))}
              className="mt-1 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Closes
            <input
              type="time"
              value={window.endTime}
              onChange={(event) => onChange(windows.map((item, itemIndex) => itemIndex === index ? { ...item, endTime: event.target.value } : item))}
              className="mt-1 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800"
            />
          </label>
          <button
            type="button"
            onClick={() => onChange(windows.filter((_, itemIndex) => itemIndex !== index))}
            className="h-10 rounded-lg px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            aria-label={`Remove ${weekDays[window.dayOfWeek]} hours`}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...windows, { dayOfWeek: 1, startTime: "", endTime: "" }])}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        + Add hours
      </button>
    </div>
  );
}

function toDraft(profile: MyDoctorProfile): ProfileDraft {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName ?? "",
    yearsOfExperience: profile.yearsOfExperience?.toString() ?? "",
    about: profile.about ?? "",
  };
}

function DoctorProfessionalProfilePage() {
  const [profile, setProfile] = useState<MyDoctorProfile | null>(null);
  const [publicProfile, setPublicProfile] = useState<Doctor | null>(null);
  const [practice, setPractice] = useState<MyDoctorPractice | null>(null);
  const [specializationOptions, setSpecializationOptions] = useState<SpecializationOption[]>([]);
  const [selectedSpecializationIds, setSelectedSpecializationIds] = useState<string[]>([]);
  const [primarySpecializationId, setPrimarySpecializationId] = useState<string | null>(null);
  const [isSavingSpecializations, setIsSavingSpecializations] = useState(false);
  const [specializationError, setSpecializationError] = useState<string | null>(null);
  const [specializationSaved, setSpecializationSaved] = useState(false);
  const [isLoadingPractice, setIsLoadingPractice] = useState(true);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [practiceDraft, setPracticeDraft] = useState(emptyPracticeFacilityDraft);
  const [savingAssignmentId, setSavingAssignmentId] = useState<string | null>(null);
  const [isAddingFacility, setIsAddingFacility] = useState(false);
  const [practiceSaveError, setPracticeSaveError] = useState<string | null>(null);
  const [practiceSavedMessage, setPracticeSavedMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    getMyDoctorProfile()
      .then((response) => {
        if (!isCurrent) return;
        setProfile(response.data);
        setDraft(toDraft(response.data));
        setError(null);
        getDoctorById(response.data.id)
          .then((detail) => {
            if (isCurrent) {
              setPublicProfile(detail.data);
              setSelectedSpecializationIds(detail.data.specializations.map((item) => item.specialization.id));
              setPrimarySpecializationId(detail.data.specializations.find((item) => item.isPrimary)?.specialization.id ?? null);
            }
          })
          .catch(() => {
            if (isCurrent) {
              setPublicProfile(null);
            }
          });
      })
      .catch((caughtError: unknown) => {
        if (!isCurrent) return;
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Could not load your professional profile.",
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    getMyDoctorPractice()
      .then((response) => {
        if (isCurrent) {
          setPractice(response.data);
          setPracticeError(null);
        }
      })
      .catch((caughtError: unknown) => {
        if (isCurrent) {
          setPracticeError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "Could not load your practice settings.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingPractice(false);
      });

    getSpecializations()
      .then((response) => {
        if (isCurrent) {
          setSpecializationOptions(response.data);
          setSpecializationError(null);
        }
      })
      .catch((caughtError: unknown) => {
        if (isCurrent) {
          setSpecializationError(caughtError instanceof ApiError ? caughtError.message : "Could not load specializations.");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  function retryPractice() {
    setIsLoadingPractice(true);
    setPracticeError(null);
    setRetryCount((count) => count + 1);
  }

  function updateAssignmentDraft(
    assignmentId: string,
    update: Partial<PracticeFacilityDraft>,
  ) {
    setPractice((current) => current && ({
      ...current,
      assignments: current.assignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              ...(update.consultationFee !== undefined ? { consultationFee: update.consultationFee } : {}),
              ...(update.consultationMode !== undefined ? { consultationMode: update.consultationMode } : {}),
              ...(update.onlineBookingEnabled !== undefined ? { onlineBookingEnabled: update.onlineBookingEnabled } : {}),
              ...(update.onlineBookingLimit !== undefined ? { onlineBookingLimit: update.onlineBookingLimit ? Number(update.onlineBookingLimit) : null } : {}),
              ...(update.availability !== undefined ? { availability: update.availability.map((window, index) => ({
                id: assignment.availability[index]?.id ?? `draft-${index}`,
                isActive: true,
                ...window,
              })) } : {}),
            }
          : assignment,
      ),
    }));
  }

  function toggleSpecialization(specializationId: string, isSelected: boolean) {
    if (isSelected) {
      const next = [...selectedSpecializationIds, specializationId];
      setSelectedSpecializationIds(next);
      if (!primarySpecializationId) setPrimarySpecializationId(specializationId);
    } else {
      const next = selectedSpecializationIds.filter((id) => id !== specializationId);
      setSelectedSpecializationIds(next);
      if (primarySpecializationId === specializationId) {
        setPrimarySpecializationId(next[0] ?? null);
      }
    }
    setSpecializationSaved(false);
    setSpecializationError(null);
  }

  async function saveSpecializations() {
    if (selectedSpecializationIds.length > 0 && !primarySpecializationId) {
      setSpecializationError("Choose one primary specialization.");
      return;
    }

    setSpecializationError(null);
    setSpecializationSaved(false);
    setIsSavingSpecializations(true);
    try {
      const response = await updateMyDoctorSpecializations({
        specializationIds: selectedSpecializationIds,
        primarySpecializationId,
      });
      setPublicProfile((current) => current && ({ ...current, specializations: response.data }));
      setSpecializationSaved(true);
    } catch (caughtError) {
      setSpecializationError(caughtError instanceof ApiError ? caughtError.message : "Could not save your specializations.");
    } finally {
      setIsSavingSpecializations(false);
    }
  }

  async function savePracticeAssignment(assignment: DoctorPracticeFacility) {
    const value = toPracticeDraft(assignment);
    if (!value.consultationFee || Number(value.consultationFee) < 0) {
      setPracticeSaveError("Enter a valid consultation fee for this practice.");
      return;
    }
    if (!value.consultationMode) {
      setPracticeSaveError("Choose the consultation mode for this practice.");
      return;
    }
    if (
      value.onlineBookingLimit &&
      (!Number.isInteger(Number(value.onlineBookingLimit)) || Number(value.onlineBookingLimit) < 1)
    ) {
      setPracticeSaveError("Online booking limit must be a positive whole number or left blank.");
      return;
    }
    if (value.availability.some((window) => !window.startTime || !window.endTime)) {
      setPracticeSaveError("Complete or remove every incomplete availability window.");
      return;
    }

    setPracticeSaveError(null);
    setPracticeSavedMessage(null);
    setSavingAssignmentId(assignment.id);
    try {
      const response = await updateMyDoctorPracticeFacility(assignment.id, {
        consultationFee: Number(value.consultationFee),
        consultationMode: value.consultationMode,
        onlineBookingEnabled: value.onlineBookingEnabled,
        onlineBookingLimit: value.onlineBookingLimit ? Number(value.onlineBookingLimit) : null,
        availability: value.availability,
      });
      setPractice((current) => current && ({
        ...current,
        assignments: current.assignments.map((item) => item.id === assignment.id ? response.data : item),
      }));
      setPracticeSavedMessage(`${assignment.facility.name} settings saved.`);
    } catch (caughtError) {
      setPracticeSaveError(caughtError instanceof ApiError ? caughtError.message : "Could not save practice settings. Please try again.");
    } finally {
      setSavingAssignmentId(null);
    }
  }

  async function addPracticeFacility(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!practiceDraft.facilityId || !practiceDraft.departmentId) {
      setPracticeSaveError("Select a facility and department.");
      return;
    }
    if (!practiceDraft.consultationFee || Number(practiceDraft.consultationFee) < 0) {
      setPracticeSaveError("Enter a valid consultation fee.");
      return;
    }
    if (!practiceDraft.consultationMode) {
      setPracticeSaveError("Choose a consultation mode.");
      return;
    }
    if (
      practiceDraft.onlineBookingLimit &&
      (!Number.isInteger(Number(practiceDraft.onlineBookingLimit)) || Number(practiceDraft.onlineBookingLimit) < 1)
    ) {
      setPracticeSaveError("Online booking limit must be a positive whole number or left blank.");
      return;
    }
    if (practiceDraft.availability.some((window) => !window.startTime || !window.endTime)) {
      setPracticeSaveError("Complete or remove every incomplete availability window.");
      return;
    }

    setPracticeSaveError(null);
    setPracticeSavedMessage(null);
    setIsAddingFacility(true);
    try {
      const response = await addMyDoctorPracticeFacility({
        ...practiceDraft,
        consultationFee: Number(practiceDraft.consultationFee),
        consultationMode: practiceDraft.consultationMode,
        onlineBookingLimit: practiceDraft.onlineBookingLimit ? Number(practiceDraft.onlineBookingLimit) : null,
      });
      setPractice((current) => current && ({
        ...current,
        assignments: [...current.assignments, response.data],
      }));
      setPracticeDraft(emptyPracticeFacilityDraft);
      setPracticeSavedMessage(`${response.data.facility.name} was added to your practice.`);
    } catch (caughtError) {
      setPracticeSaveError(caughtError instanceof ApiError ? caughtError.message : "Could not add this facility. Please try again.");
    } finally {
      setIsAddingFacility(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (
      draft.yearsOfExperience !== "" &&
      (!Number.isInteger(Number(draft.yearsOfExperience)) ||
        Number(draft.yearsOfExperience) < 0)
    ) {
      setError("Years of experience must be a non-negative whole number.");
      return;
    }
    setError(null);
    setSaved(false);
    setIsSaving(true);

    try {
      const result = await updateMyDoctorProfile({
        firstName: draft.firstName.trim(),
        ...(draft.lastName.trim() ? { lastName: draft.lastName.trim() } : {}),
        ...(draft.yearsOfExperience !== ""
          ? { yearsOfExperience: Number(draft.yearsOfExperience) }
          : {}),
        ...(draft.about.trim() ? { about: draft.about.trim() } : {}),
      });
      setProfile(result.data);
      setDraft(toDraft(result.data));
      setSaved(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Could not save your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-600">Loading your profile...</p>;
  }

  if (!profile) {
    return (
      <section className="max-w-2xl rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-rose-700">
          Profile unavailable
        </p>
        <p className="mt-2 text-sm text-slate-600">
          {error ?? "Your professional profile could not be loaded."}
        </p>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setRetryCount((count) => count + 1);
          }}
          className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Try again
        </button>
      </section>
    );
  }

  const inputClassName =
    "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10";

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-10">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
        <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-cyan-200">DOCTOR WORKSPACE / PROFESSIONAL PROFILE</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Practice settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80">Manage your public profile, clinic affiliations, consultation fees and weekly appointment hours.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-sm font-semibold">Dr. {[profile.firstName, profile.lastName].filter(Boolean).join(" ")}</p>
            <p className="mt-1 text-xs text-blue-100/70">{profile.yearsOfExperience ?? "Experience not set"}{profile.yearsOfExperience != null ? " years in practice" : ""}</p>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            First name
            <input
              required
              maxLength={100}
              value={draft.firstName}
              onChange={(event) =>
                setDraft({ ...draft, firstName: event.target.value })
              }
              className={inputClassName}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Last name
            <input
              maxLength={100}
              value={draft.lastName}
              onChange={(event) =>
                setDraft({ ...draft, lastName: event.target.value })
              }
              className={inputClassName}
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Licence number
            <input
              value={profile.licenseNumber}
              readOnly
              className={`${inputClassName} bg-slate-50 text-slate-500`}
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Licence details and verification are read-only and managed through the verification process.
            </span>
          </label>
          <div className="text-sm font-medium text-slate-700 sm:col-span-2">
            Licence authority
            <p className={`${inputClassName} bg-slate-50 text-slate-500`}>
              {profile.licenseAuthority || "Not provided"}
            </p>
          </div>
          <div className="text-sm font-medium text-slate-700 sm:col-span-2">
            Verification status
            <p className="mt-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.licenseVerificationStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                {profile.licenseVerificationStatus.replaceAll("_", " ")}
              </span>
              <span className="ml-2 text-xs font-normal text-slate-500">Read-only</span>
            </p>
          </div>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Years of experience
            <input
              type="number"
              min={0}
              step={1}
              value={draft.yearsOfExperience}
              onChange={(event) =>
                setDraft({ ...draft, yearsOfExperience: event.target.value })
              }
              className={inputClassName}
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Professional summary
            <textarea
              rows={6}
              value={draft.about}
              onChange={(event) =>
                setDraft({ ...draft, about: event.target.value })
              }
              className={inputClassName}
            />
          </label>
        </div>

        <p className="text-xs text-slate-500">
          Leave optional fields blank to keep their current values. Specializations, facility affiliations, fees, consultation modes, and availability are shown below when available; this API does not support editing them.
        </p>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Your professional profile has been saved.
          </p>
        )}

        <div className="flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Practice management</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Facilities, fees & availability</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">Add a verified facility, set your consultation details and choose weekly hours patients can book.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Hours use each facility’s timezone</span>
        </div>

        {practiceSaveError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{practiceSaveError}</p>}
        {practiceSavedMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{practiceSavedMessage}</p>}

        {isLoadingPractice ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Loading practice settings…</p> : practiceError ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"><p className="text-sm text-rose-700">{practiceError}</p><button type="button" onClick={retryPractice} className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-rose-700">Retry</button></div> : practice && <>
          <div className="space-y-4">
            {practice.assignments.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center"><p className="font-semibold text-slate-800">No practice locations yet</p><p className="mt-1 text-sm text-slate-500">Add a verified facility below to publish your consultation details.</p></div>}
            {practice.assignments.map((assignment) => {
              const value = toPracticeDraft(assignment);
              return <article key={assignment.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div><h3 className="text-lg font-bold text-slate-900">{assignment.facility.name}</h3><p className="mt-1 text-sm text-slate-600">{assignment.department.name}</p><p className="mt-1 text-xs text-slate-500">Timezone: {assignment.facility.timezone ?? "Not provided"}</p></div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${assignment.onlineBookingEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>{assignment.onlineBookingEnabled ? "Online booking on" : "Online booking off"}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="text-xs font-bold text-slate-600">Consultation fee (₹)<input type="number" min={0} step="0.01" value={value.consultationFee} onChange={(event) => updateAssignmentDraft(assignment.id, { consultationFee: event.target.value })} className={inputClassName} /></label>
                  <label className="text-xs font-bold text-slate-600">Consultation mode<select value={value.consultationMode} onChange={(event) => updateAssignmentDraft(assignment.id, { consultationMode: event.target.value as PracticeFacilityDraft["consultationMode"] })} className={inputClassName}><option value="IN_PERSON">In person</option><option value="OFFLINE">In person (legacy)</option><option value="ONLINE">Online</option><option value="BOTH">In person & online</option></select></label>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 sm:mt-5"><input type="checkbox" checked={value.onlineBookingEnabled} onChange={(event) => updateAssignmentDraft(assignment.id, { onlineBookingEnabled: event.target.checked })} className="h-4 w-4 accent-blue-700" />Enable online booking</label>
                  <label className="text-xs font-bold text-slate-600">Daily booking limit <span className="font-normal text-slate-400">(optional)</span><input type="number" min={1} step={1} value={value.onlineBookingLimit} onChange={(event) => updateAssignmentDraft(assignment.id, { onlineBookingLimit: event.target.value })} className={inputClassName} placeholder="No limit" /></label>
                </div>
                <div className="mt-5 border-t border-slate-200 pt-5"><div className="mb-3"><h4 className="text-sm font-bold text-slate-800">Weekly availability</h4><p className="mt-1 text-xs text-slate-500">Patients see these hours in {assignment.facility.timezone ?? "the facility’s local timezone"}.</p></div><AvailabilityEditor windows={value.availability} onChange={(availability) => updateAssignmentDraft(assignment.id, { availability })} /></div>
                <div className="mt-5 flex justify-end border-t border-slate-200 pt-4"><button type="button" onClick={() => void savePracticeAssignment(assignment)} disabled={savingAssignmentId !== null || isAddingFacility} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">{savingAssignmentId === assignment.id ? "Saving practice…" : "Save practice settings"}</button></div>
              </article>;
            })}
          </div>

          <form onSubmit={(event) => void addPracticeFacility(event)} className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:p-6">
            <div className="mb-5"><h3 className="text-lg font-bold text-slate-900">Add a practice location</h3><p className="mt-1 text-sm text-slate-500">Choose an existing verified MediConnect facility. A facility must be verified before doctors can affiliate with it.</p></div>
            {practice.facilities.filter((facility) => facility.departments.length > 0).length === 0 ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">No verified facilities with departments are currently available. Ask the facility administrator to add and verify the location.</p> : <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Facility<select required value={practiceDraft.facilityId} onChange={(event) => setPracticeDraft({ ...practiceDraft, facilityId: event.target.value, departmentId: "" })} className={inputClassName}><option value="">Choose a verified facility</option>{practice.facilities.filter((facility) => facility.departments.length > 0).map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}</select></label>
                <label className="text-sm font-semibold text-slate-700">Department<select required value={practiceDraft.departmentId} onChange={(event) => setPracticeDraft({ ...practiceDraft, departmentId: event.target.value })} disabled={!practiceDraft.facilityId} className={inputClassName}><option value="">Choose a department</option>{(practice.facilities.find((facility) => facility.id === practiceDraft.facilityId)?.departments ?? []).map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
                <label className="text-sm font-semibold text-slate-700">Consultation fee (₹)<input required type="number" min={0} step="0.01" value={practiceDraft.consultationFee} onChange={(event) => setPracticeDraft({ ...practiceDraft, consultationFee: event.target.value })} className={inputClassName} placeholder="Enter amount" /></label>
                <label className="text-sm font-semibold text-slate-700">Consultation mode<select required value={practiceDraft.consultationMode} onChange={(event) => setPracticeDraft({ ...practiceDraft, consultationMode: event.target.value as PracticeFacilityDraft["consultationMode"] })} className={inputClassName}><option value="">Choose a mode</option><option value="IN_PERSON">In person</option><option value="ONLINE">Online</option><option value="BOTH">In person & online</option></select></label>
                <label className="text-sm font-semibold text-slate-700">Daily booking limit <span className="font-normal text-slate-400">(optional)</span><input type="number" min={1} step={1} value={practiceDraft.onlineBookingLimit} onChange={(event) => setPracticeDraft({ ...practiceDraft, onlineBookingLimit: event.target.value })} className={inputClassName} placeholder="No limit" /></label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 sm:mt-5"><input type="checkbox" checked={practiceDraft.onlineBookingEnabled} onChange={(event) => setPracticeDraft({ ...practiceDraft, onlineBookingEnabled: event.target.checked })} className="h-4 w-4 accent-blue-700" />Enable online booking</label>
              </div>
              <div className="mt-5"><h4 className="mb-1 text-sm font-bold text-slate-800">Weekly availability</h4><p className="mb-3 text-xs text-slate-500">Enter working hours in the selected facility’s timezone.</p><AvailabilityEditor windows={practiceDraft.availability} onChange={(availability) => setPracticeDraft({ ...practiceDraft, availability })} /></div>
              <div className="mt-5 flex justify-end border-t border-blue-100 pt-4"><button type="submit" disabled={isAddingFacility || savingAssignmentId !== null} className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{isAddingFacility ? "Adding practice…" : "Add facility to practice"}</button></div>
            </>}
          </form>
        </>}
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Specializations</h2>
          {isLoadingPractice ? (
            <p className="mt-2 text-sm text-slate-500">Loading practice details...</p>
          ) : practiceError ? (
            <div className="mt-2 flex items-center gap-3 text-sm text-rose-700">
              <span>Practice details could not be loaded.</span>
              <button type="button" onClick={() => { setIsLoading(true); setIsLoadingPractice(true); setRetryCount((count) => count + 1); }} className="font-semibold text-blue-700 hover:underline">Retry</button>
            </div>
          ) : publicProfile?.specializations.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {publicProfile.specializations.map(({ id, specialization, isPrimary }) => (
                <span key={id} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-800">
                  {specialization.name}{isPrimary ? " · Primary" : ""}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No specialization details available.</p>
          )}
        </div>

        <div className="border-t border-slate-100 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-bold text-slate-900">Manage specializations</h2><p className="mt-1 text-sm text-slate-500">Select your clinical focus areas and mark one as primary.</p></div>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="text-sm font-semibold text-blue-700 hover:underline">Refresh list</button>
          </div>
          {specializationError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{specializationError}</p>}
          {specializationOptions.length === 0 ? <p className="mt-3 text-sm text-slate-500">No specialization options are available right now.</p> : <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {specializationOptions.map((specialization) => {
              const selected = selectedSpecializationIds.includes(specialization.id);
              return <div key={specialization.id} className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition ${selected ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={selected} onChange={(event) => toggleSpecialization(specialization.id, event.target.checked)} className="h-4 w-4 accent-blue-700" />
                  <span className="text-sm font-semibold text-slate-800">{specialization.name}</span>
                </label>
                {selected && <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500"><input type="radio" name="primarySpecialization" aria-label={`Set ${specialization.name} as primary`} checked={primarySpecializationId === specialization.id} onChange={() => { setPrimarySpecializationId(specialization.id); setSpecializationSaved(false); }} className="h-4 w-4 accent-blue-700" />Primary</label>}
              </div>;
            })}
          </div>}
          {specializationSaved && <p role="status" className="mt-3 text-sm text-emerald-700">Specializations saved.</p>}
          <div className="mt-4 flex justify-end"><button type="button" onClick={() => void saveSpecializations()} disabled={isSavingSpecializations || specializationOptions.length === 0} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50">{isSavingSpecializations ? "Saving..." : "Save specializations"}</button></div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h2 className="text-lg font-semibold text-slate-900">Patient-facing practice details</h2>
          {practice?.assignments.length ? (
            <div className="mt-3 space-y-3">
              {practice.assignments.map((facility) => (
                <article key={facility.id} className="rounded-xl bg-slate-50 p-4">
                  <h3 className="font-medium text-slate-900">{facility.facility.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{facility.department.name}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Fee: {facility.consultationFee} · Mode: {facility.consultationMode}
                  </p>
                  {facility.availability?.length ? (
                    <p className="mt-1 text-xs text-slate-500">
                      Working hours: {facility.availability.map((slot) => `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][slot.dayOfWeek] ?? "Day"} ${slot.startTime.slice(11, 16)}–${slot.endTime.slice(11, 16)}`).join(", ")}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No facility or practice details available.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default DoctorProfessionalProfilePage;
