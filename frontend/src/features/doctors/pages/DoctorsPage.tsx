import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getDoctors,
  getSpecializations,
  type SpecializationOption,
} from "../index";
import type { Doctor } from "../types";

const PAGE_SIZE = 9;

function formatFee(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amount)
    : null;
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const primarySpecialization =
    doctor.specializations.find((item) => item.isPrimary) ??
    doctor.specializations[0];
  const fees = doctor.facilities
    .map((facility) => Number(facility.consultationFee))
    .filter((fee) => Number.isFinite(fee));
  const lowestFee = fees.length ? formatFee(String(Math.min(...fees))) : null;
  const facilities = Array.from(
    new Set(doctor.facilities.map((item) => item.facility.name).filter(Boolean)),
  );
  const initials = `${doctor.firstName[0] ?? "D"}${doctor.lastName?.[0] ?? ""}`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-semibold text-blue-700"
        >
          {initials.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-slate-900">
              <Link
                to={`/doctors/${doctor.id}`}
                className="hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Dr. {doctor.firstName} {doctor.lastName ?? ""}
              </Link>
            </h2>
            {doctor.licenseVerificationStatus === "VERIFIED" && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                Verified
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-blue-700">
            {primarySpecialization?.specialization.name ?? "Specialization not listed"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {doctor.yearsOfExperience !== null && doctor.yearsOfExperience !== undefined
              ? `${doctor.yearsOfExperience} ${doctor.yearsOfExperience === 1 ? "year" : "years"} experience`
              : "Experience not listed"}
          </p>
        </div>
      </div>

      {doctor.about && (
        <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
          {doctor.about}
        </p>
      )}

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
        {lowestFee && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Consultation fee from</span>
            <span className="font-semibold text-slate-900">{lowestFee}</span>
          </div>
        )}
        {facilities.length > 0 && (
          <div className="flex items-start justify-between gap-3">
            <span className="shrink-0 text-slate-500">Facility</span>
            <span className="text-right text-slate-700">
              {facilities.slice(0, 2).join(", ")}
              {facilities.length > 2 && ` +${facilities.length - 2} more`}
            </span>
          </div>
        )}
        {!lowestFee && facilities.length === 0 && (
          <p className="text-slate-500">Practice details not listed</p>
        )}
      </div>

      <div className="mt-auto flex gap-3 pt-6">
        <Link
          to={`/doctors/${doctor.id}`}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          View profile
        </Link>
        <Link
          to={`/doctors/${doctor.id}/book`}
          className="flex-1 rounded-xl bg-blue-700 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Book
        </Link>
      </div>
    </article>
  );
}

export default function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(true);
  const [specializationsError, setSpecializationsError] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [specializationSearch, setSpecializationSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    getSpecializations()
      .then((response) => {
        if (active) setSpecializations(response.data);
      })
      .catch(() => {
        if (active) setSpecializationsError(true);
      })
      .finally(() => {
        if (active) setSpecializationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const requestedSpecialization = searchParams.get("specialty") ?? searchParams.get("specializationId") ?? "";
  const specializationId = specializations.find(
    (item) => item.id === requestedSpecialization || item.name.localeCompare(requestedSpecialization, undefined, { sensitivity: "accent" }) === 0,
  )?.id ?? "";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      if (nextSearch !== search) {
        setSearch(nextSearch);
        setCurrentPage(1);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    let active = true;
    async function fetchDoctors() {
      setLoading(true);
      setError(null);
      try {
        const response = await getDoctors({
          page: currentPage,
          limit: PAGE_SIZE,
          ...(search ? { search } : {}),
          ...(specializationId ? { specializationId } : {}),
        });
        if (!active) return;
        setDoctors(response.data.items);
        setTotalResults(response.data.pagination.total);
        setTotalPages(Math.max(1, response.data.pagination.totalPages));
      } catch (requestError: unknown) {
        if (!active) return;
        console.error("Failed to fetch doctors:", requestError);
        setError("We couldn't load doctors. Check your connection and try again.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchDoctors();
    return () => {
      active = false;
    };
  }, [currentPage, retryCount, search, specializationId]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setSpecializationSearch("");
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
  }

  function chooseSpecialization(id: string) {
    const selected = specializations.find((item) => item.id === id);
    const nextParams = new URLSearchParams(searchParams);
    if (selected) nextParams.set("specialty", selected.name);
    else {
      nextParams.delete("specialty");
      nextParams.delete("specializationId");
    }
    setSearchParams(nextParams, { replace: true });
    setCurrentPage(1);
  }

  const filteredSpecializations = specializations.filter((item) =>
    item.name.toLocaleLowerCase().includes(specializationSearch.trim().toLocaleLowerCase()),
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            MediConnect directory
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Find a doctor
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Browse verified healthcare professionals and explore their practice details.
          </p>
          <label htmlFor="doctor-search" className="sr-only">Search doctors by name</label>
          <div className="relative mt-6 max-w-3xl">
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
            </span>
            <input
            id="doctor-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search doctors by name"
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section aria-label="Doctor search filters" className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Find the right specialist</h2>
              <p className="mt-1 text-sm text-slate-500">Choose a clinical specialty to narrow verified doctor results.</p>
            </div>
            <button type="button" onClick={clearFilters} className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">Clear filters</button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(220px,0.8fr)_minmax(260px,1.2fr)]">
            <div>
              <label htmlFor="specialization-search" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search specialties</label>
              <input id="specialization-search" type="search" value={specializationSearch} onChange={(event) => setSpecializationSearch(event.target.value)} placeholder="e.g. heart, skin, children" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
            </div>
            <div>
              <label htmlFor="specialization-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Specialization</label>
              <select id="specialization-filter" value={specializationId} onChange={(event) => chooseSpecialization(event.target.value)} disabled={specializationsLoading || specializations.length === 0} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100">
                <option value="">All specialties</option>
                {filteredSpecializations.map((specialization) => <option key={specialization.id} value={specialization.id}>{specialization.name}</option>)}
              </select>
            </div>
          </div>
          {specializationsError && <p role="status" className="mt-3 text-sm text-amber-700">Specialties could not be loaded. Name search and browsing are still available.</p>}
          {specializationId && <p className="mt-3 text-sm text-slate-600">Showing doctors specializing in <span className="font-semibold text-blue-700">{specializations.find((item) => item.id === specializationId)?.name}</span></p>}
        </section>
        <section aria-labelledby="doctor-results-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="doctor-results-heading" className="text-xl font-semibold text-slate-900">
                Doctors
              </h2>
              <p className="mt-1 text-sm text-slate-600" aria-live="polite">
                {loading ? "Loading doctors…" : `${totalResults} ${totalResults === 1 ? "doctor" : "doctors"} found`}
              </p>
            </div>
            <p className="text-sm text-slate-500">Sorted by name</p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-600" role="status">
              Loading doctors…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-10 text-center">
              <p className="text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                Try again
              </button>
            </div>
          ) : doctors.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
              <h3 className="text-lg font-semibold text-slate-900">No doctors found</h3>
              <p className="mt-2 text-sm text-slate-600">Try another name or specialization.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
              </div>
              {totalPages > 1 && (
                <nav aria-label="Doctor results pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      aria-current={currentPage === page ? "page" : undefined}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-3.5 py-2 text-sm ${currentPage === page ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
