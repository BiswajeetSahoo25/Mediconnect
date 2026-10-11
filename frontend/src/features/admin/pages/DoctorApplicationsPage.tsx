import { useEffect, useState } from "react";
import { ApiError } from "../../../services/api";
import {
  approveDoctorApplication,
  getPendingDoctorApplications,
  type PendingDoctorApplication,
} from "../services/doctorApplications.service";

function DoctorApplicationsPage() {
  const [applications, setApplications] = useState<PendingDoctorApplication[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    getPendingDoctorApplications(page)
      .then((result) => {
        if (!isCurrent) return;
        if (page > 1 && result.pagination.totalPages < page) {
          setPage(Math.max(1, result.pagination.totalPages));
          return;
        }
        setApplications(result.items);
        setTotal(result.pagination.total);
        setTotalPages(Math.max(1, result.pagination.totalPages));
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        setLoadingError(
          error instanceof ApiError ? error.message : "Could not load pending applications.",
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [page, retryCount]);

  async function handleApprove(application: PendingDoctorApplication) {
    const doctorName = `${application.firstName}${application.lastName ? ` ${application.lastName}` : ""}`;
    if (!window.confirm(`Approve ${doctorName}'s doctor application? This verifies the licence and grants doctor account access.`)) {
      return;
    }

    setProcessingId(application.id);
    setActionError(null);
    setLoadingError(null);
    setSuccessMessage(null);
    try {
      await approveDoctorApplication(application.id);
      setSuccessMessage(`${doctorName} was approved.`);
      setIsLoading(true);
      setRetryCount((count) => count + 1);
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : "The application could not be approved.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-7">
        <p className="text-sm font-medium text-teal-700">Administration</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Doctor applications</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Review pending licence applications before granting doctor access.</p>
      </header>

      {actionError && <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</p>}
      {successMessage && <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</p>}

      {isLoading ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading applications...</p>
      ) : loadingError ? (
        <section className="rounded-2xl border border-rose-200 bg-white p-6">
          <p role="alert" className="text-sm text-rose-700">{loadingError}</p>
          <button type="button" onClick={() => { setIsLoading(true); setLoadingError(null); setRetryCount((count) => count + 1); }} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Try again</button>
        </section>
      ) : applications.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900">No pending applications</p>
          <p className="mt-2 text-sm text-slate-600">New doctor applications will appear here for review.</p>
        </section>
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-600">{total} pending {total === 1 ? "application" : "applications"}</p>
          <div className="space-y-4">
            {applications.map((application) => (
              <article key={application.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">Dr. {application.firstName}{application.lastName ? ` ${application.lastName}` : ""}</h2>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Pending</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{application.user.email}{application.user.phone ? ` · ${application.user.phone}` : ""}</p>
                  </div>
                  <button type="button" disabled={processingId !== null} onClick={() => void handleApprove(application)} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {processingId === application.id ? "Approving..." : "Approve application"}
                  </button>
                </div>

                <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Licence number</dt><dd className="mt-1 text-sm text-slate-800">{application.licenseNumber}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Registration authority</dt><dd className="mt-1 text-sm text-slate-800">{application.licenseAuthority || "Not provided"}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Experience</dt><dd className="mt-1 text-sm text-slate-800">{application.yearsOfExperience === null ? "Not provided" : `${application.yearsOfExperience} years`}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</dt><dd className="mt-1 text-sm text-slate-800">{new Date(application.createdAt).toLocaleDateString()}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Specializations</dt><dd className="mt-1 text-sm text-slate-800">{application.specializations.length ? application.specializations.map(({ specialization, isPrimary }) => `${specialization.name}${isPrimary ? " (primary)" : ""}`).join(", ") : "Not provided"}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Professional summary</dt><dd className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{application.about || "Not provided"}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <button type="button" disabled={page <= 1} onClick={() => { setIsLoading(true); setLoadingError(null); setPage((value) => value - 1); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Previous</button>
            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => { setIsLoading(true); setLoadingError(null); setPage((value) => value + 1); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default DoctorApplicationsPage;
