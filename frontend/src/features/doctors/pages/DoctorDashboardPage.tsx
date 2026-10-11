import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../../services/api";
import { getDoctorAppointments } from "../../appointments/services/appointment.service";
import { getMyDoctorProfile } from "../services/doctor.service";
import type { MyDoctorProfile } from "../types";

type DashboardData = {
  profile: MyDoctorProfile;
  totalAppointments: number;
  upcomingAppointments: number;
};

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function DoctorDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      getMyDoctorProfile(),
      getDoctorAppointments({ page: 1, limit: 1 }),
      getDoctorAppointments({
        page: 1,
        limit: 1,
        status: "SCHEDULED",
        from: today,
      }),
    ])
      .then(([profileResponse, allAppointments, scheduledAppointments]) => {
        if (!isCurrent) return;

        setDashboard({
          profile: profileResponse.data,
          totalAppointments: allAppointments.data.pagination.total,
          upcomingAppointments:
            scheduledAppointments.data.pagination.total,
        });
        setError(null);
      })
      .catch((caughtError: unknown) => {
        if (!isCurrent) return;
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Could not load your dashboard. Please try again.",
        );
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  function retry() {
    setIsLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl" aria-live="polite">
        <p className="text-sm text-slate-600">Loading your doctor dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <section className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-rose-700">Dashboard unavailable</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {error ?? "Your dashboard data could not be loaded."}
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Try again
        </button>
      </section>
    );
  }

  const { profile, totalAppointments, upcomingAppointments } = dashboard;
  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header>
        <p className="text-sm font-medium text-teal-700">Doctor workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Welcome, Dr. {fullName}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Here is a summary of your professional profile and appointments.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Upcoming scheduled appointments
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {upcomingAppointments}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {upcomingAppointments === 0
              ? "No upcoming scheduled appointments."
              : "Scheduled for today or a later date."}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total appointments
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {totalAppointments}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {totalAppointments === 0
              ? "No appointments are associated with your profile yet."
              : "All appointments associated with your doctor profile."}
          </p>
        </article>
      </section>
      <Link
        to="/doctor-dashboard/appointments"
        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
        Manage appointments
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-teal-700">
              Professional profile
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {fullName}
            </h2>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800">
            Licence {formatStatus(profile.licenseVerificationStatus)}
          </span>
        </div>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Years of experience
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {profile.yearsOfExperience == null
                ? "Not provided"
                : `${profile.yearsOfExperience} ${profile.yearsOfExperience === 1 ? "year" : "years"}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Licence number
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">
              {profile.licenseNumber || "Not provided"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Professional summary
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
            {profile.about?.trim() || "No professional summary added yet."}
          </p>
        </div>

        <Link
          to={`/doctors/${encodeURIComponent(profile.id)}`}
          className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          View public profile <span aria-hidden="true" className="ml-1">→</span>
        </Link>
        <Link
          to="/doctor-dashboard/profile"
          className="ml-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
        >
          Manage professional profile
        </Link>
      </section>
    </div>
  );
}

export default DoctorDashboardPage;
