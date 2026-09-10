import { useState, type FormEvent } from "react";
import { ApiError, createDoctorApplication } from "../services/api";

function DoctorApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setIsSubmitting(true);
    try {
      await createDoctorApplication({
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
        licenseNumber: String(form.get("licenseNumber")),
        licenseAuthority: String(form.get("licenseAuthority")) || undefined,
        yearsOfExperience: Number(form.get("yearsOfExperience")),
        about: String(form.get("about")) || undefined,
      });
      setSubmitted(true);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Could not submit your application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-medium text-teal-700">Professional access</p>
      <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Apply as a doctor</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Tell us about your qualifications. Applications are reviewed before a doctor workspace is activated.</p>
      {submitted ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h3 className="font-semibold text-emerald-900">Application saved for review</h3>
          <p className="mt-2 text-sm text-emerald-800">We&apos;ll notify you when the verification workflow is available. Your account remains a patient account until approval.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">First name<input required name="firstName" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900" /></label>
          <label className="text-sm font-medium text-slate-700">Last name<input required name="lastName" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900" /></label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Medical licence number<input required name="licenseNumber" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900" /></label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Licensing authority<input name="licenseAuthority" placeholder="e.g. National Medical Commission" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900" /></label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Years of experience<input required name="yearsOfExperience" min="0" type="number" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900" /></label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">Professional summary<textarea name="about" rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:border-slate-900" /></label>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
          <button disabled={isSubmitting} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:col-span-2">{isSubmitting ? "Submitting..." : "Submit application"}</button>
        </form>
      )}
    </div>
  );
}

export default DoctorApplicationPage;
