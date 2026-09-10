import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError, completeOnboarding, updatePatient } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setIsSubmitting(true);

    try {
      await updatePatient({
        firstName: String(form.get("firstName") ?? ""),
        lastName: String(form.get("lastName") ?? ""),
        dateOfBirth: String(form.get("dateOfBirth") ?? ""),
        gender: String(form.get("gender") ?? ""),
        bloodGroup: String(form.get("bloodGroup") ?? ""),
      });
      await completeOnboarding();
      await refreshUser();
      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "We could not save your profile. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-teal-700">Step 1 of 1</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Let&apos;s set up your care profile
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          These details help MediConnect personalise appointments and records.
          You can change them later in your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            First name
            <input required name="firstName" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Last name
            <input required name="lastName" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Date of birth
            <input required name="dateOfBirth" type="date" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Gender
            <select required name="gender" defaultValue="" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10">
              <option value="" disabled>Select an option</option>
              <option>Female</option>
              <option>Male</option>
              <option>Non-binary</option>
              <option>Prefer not to say</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Blood group
            <select required name="bloodGroup" defaultValue="" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10">
              <option value="" disabled>Select your blood group</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
            </select>
          </label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
          <button disabled={isSubmitting} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2">
            {isSubmitting ? "Saving your profile..." : "Finish setup"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default OnboardingPage;
