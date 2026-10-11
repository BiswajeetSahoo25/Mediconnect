import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../../services/api";
import {
  getDoctorById,
  getMyDoctorProfile,
  updateMyDoctorProfile,
} from "../services/doctor.service";
import type { Doctor, MyDoctorProfile } from "../types";

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
  const [isLoadingPractice, setIsLoadingPractice] = useState(true);
  const [practiceError, setPracticeError] = useState(false);
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
              setPracticeError(false);
            }
          })
          .catch(() => {
            if (isCurrent) {
              setPublicProfile(null);
              setPracticeError(true);
            }
          })
          .finally(() => {
            if (isCurrent) setIsLoadingPractice(false);
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

    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

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
    <div className="mx-auto max-w-3xl">
      <header className="mb-7">
        <p className="text-sm font-medium text-teal-700">Professional account</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Manage your profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Update the professional details shown on your MediConnect profile.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
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

      <section className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
          <h2 className="text-lg font-semibold text-slate-900">Practice affiliations</h2>
          {publicProfile?.facilities.length ? (
            <div className="mt-3 space-y-3">
              {publicProfile.facilities.map((facility) => (
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
