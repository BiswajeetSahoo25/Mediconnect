import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMedicines } from "../services/medicine.service";
import type { MedicinePreview } from "../types/medicine";
import { getMedicineImage, getMedicineImageAlt } from "../utils/medicineImage";

function getPaginationRange(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const range: (number | "...")[] = [1];

  if (currentPage > 3) {
    range.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (currentPage < totalPages - 2) {
    range.push("...");
  }

  range.push(totalPages);

  return range;
}

function formatMedicineName(name: string): string {
  return name
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function MedicineCard({ medicine }: { medicine: MedicinePreview }) {
  const displayName = formatMedicineName(medicine.name);
  const imageSrc = getMedicineImage(medicine.name);
  const imageAlt = getMedicineImageAlt(medicine.name);

  return (
    <Link
      to={`/medicines/${encodeURIComponent(medicine.id)}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div className="p-5">
        {/* Medicine header */}
        <div className="flex items-center gap-4">
          {/* Circular medicine image */}
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Medicine name + badges */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#1a73e8]/10 px-3 py-1 font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
                {medicine.source}
              </span>

              {medicine.dosageForm && (
                <span className="rounded-full bg-slate-100 px-3 py-1 font-['DM_Sans'] text-xs text-slate-500">
                  {medicine.dosageForm}
                </span>
              )}
            </div>

            <h3 className="mt-3 font-['Outfit'] text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#1a73e8]">
              {displayName}
            </h3>
          </div>
        </div>

        {/* Medicine details */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          {medicine.genericName && (
            <p className="font-['DM_Sans'] text-sm text-slate-500 italic">
              Generic: {formatMedicineName(medicine.genericName)}
            </p>
          )}

          {medicine.manufacturer && (
            <p className="mt-3 flex items-center gap-1.5 font-['DM_Sans'] text-xs text-slate-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              >
                <path
                  d="M20 7h-4.586l-1.121-1.121-6.586 6.586-4.121-4.121L1 15.586 3.414 18l8.67-8.67-4.586-4.586L20 7z"
                  fill="currentColor"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>

              {medicine.manufacturer}
            </p>
          )}

          {medicine.route && (
            <p className="mt-2 flex items-center gap-1.5 font-['DM_Sans'] text-xs text-slate-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                aria-hidden="true"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
              Route: {medicine.route}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="font-['DM_Sans'] text-xs text-slate-400">
            {medicine.source} drug information
          </span>

          <span className="font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}

function MedicineSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
      {/* Medicine header skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-slate-200" />

        <div className="flex-1">
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
          </div>

          <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      {/* Details skeleton */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-200" />

        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
      </div>

      {/* Footer skeleton */}
      <div className="mt-5 flex justify-between border-t border-slate-100 pt-4">
        <div className="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-3.5 w-16 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

function MedicinesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [medicines, setMedicines] = useState<MedicinePreview[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setSearchInputValue = useState(search)[1];

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadMedicines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMedicines({
        search: search.trim() || undefined,
        page,
        limit: 20,
      });

      setMedicines(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalMedicines(response.pagination.total);
    } catch {
      setError("Unable to load medicine information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  function updateParams(updates: { search?: string; page?: number }) {
    const params = new URLSearchParams(searchParams);

    if (updates.search !== undefined) {
      if (updates.search.trim()) {
        params.set("search", updates.search);
      } else {
        params.delete("search");
      }
    }

    if (updates.page !== undefined) {
      if (updates.page === 1) {
        params.delete("page");
      } else {
        params.set("page", String(updates.page));
      }
    }

    setSearchParams(params);
  }

  function handleSearchChange(value: string) {
    setSearchInputValue(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      updateParams({ search: value, page: 1 });
    }, 350);
  }

  function handlePreviousPage() {
    if (page > 1) {
      updateParams({ page: page - 1 });
    }
  }

  function handleNextPage() {
    if (page < totalPages) {
      updateParams({ page: page + 1 });
    }
  }

  function handlePageChange(pageNumber: number) {
    updateParams({ page: pageNumber });
  }

  return (
    <div className="bg-[#f8fafc] text-slate-900">
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-[#1a73e8]/10 px-4 py-2 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]">
              Medicine Information
            </span>

            <h1 className="mt-5 font-['Outfit'] text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Explore medicines,{" "}
              <span className="text-[#1a73e8]">understand them.</span>
            </h1>

            <p className="mt-5 max-w-2xl font-['DM_Sans'] text-base leading-7 text-slate-600 sm:text-lg">
              Browse medicines and access official FDA drug information
              including active ingredients, indications, dosage information,
              warnings, and other labeling details.
            </p>
          </div>

          {/* Search */}
          <div className="mt-10 max-w-2xl">
            <label htmlFor="medicine-search" className="sr-only">
              Search medicines
            </label>

            <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-[#1a73e8] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1a73e8]/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 shrink-0 text-slate-400"
                aria-hidden="true"
              >
                <path
                  d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              <input
                id="medicine-search"
                type="search"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search by medicine name..."
                className="ml-3 w-full bg-transparent font-['DM_Sans'] text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Medicines */}
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-['DM_Sans'] text-sm font-semibold uppercase tracking-[0.14em] text-[#1a73e8]">
              Medicine information
            </p>

            <h2 className="mt-2 font-['Outfit'] text-2xl font-bold text-slate-900 sm:text-3xl">
              {search ? `Results for "${search}"` : "Browse medicines by name"}
            </h2>
          </div>

          <p className="font-['DM_Sans'] text-sm text-slate-500">
            {totalMedicines > 0
              ? `${totalMedicines} medicines found`
              : "Information from FDA drug labeling"}
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <MedicineSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          /* Error */
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
            <p className="font-['DM_Sans'] text-sm text-red-600">{error}</p>

            <p className="mt-2 font-['DM_Sans'] text-xs text-red-500">
              Medicine data is sourced from the U.S. FDA. If this issue
              persists, the FDA API may be temporarily unavailable.
            </p>

            <button
              type="button"
              onClick={loadMedicines}
              className="mt-4 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]"
            >
              Try again
            </button>
          </div>
        ) : medicines.length === 0 ? (
          /* No medicines */
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
            <h3 className="font-['Outfit'] text-xl font-semibold text-slate-900">
              {search ? "No medicines found" : "No medicines to display"}
            </h3>

            <p className="mt-2 font-['DM_Sans'] text-sm text-slate-500">
              {search
                ? "Try a different search term. FDA drug labeling data may not include all medicines."
                : "FDA drug labeling data is available for many approved medicines."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => updateParams({ search: "", page: 1 })}
                className="mt-4 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Medicine cards */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {medicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-['DM_Sans'] text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:text-[#1a73e8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {getPaginationRange(page, totalPages).map(
                      (pageNumber, idx) =>
                        pageNumber === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="flex h-10 w-10 items-center justify-center font-['DM_Sans'] text-sm text-slate-400"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() => handlePageChange(pageNumber)}
                            className={`h-10 w-10 rounded-xl font-['DM_Sans'] text-sm font-semibold transition ${
                              page === pageNumber
                                ? "bg-[#1a73e8] text-white"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#1a73e8]"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        ),
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-['DM_Sans'] text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:text-[#1a73e8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>

                <p className="font-['DM_Sans'] text-xs text-slate-400">
                  Showing page {page} of {totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* About FDA information */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-[#1a73e8]/10 px-4 py-2 font-['DM_Sans'] text-sm font-semibold text-[#1a73e8]">
              About this information
            </span>

            <h2 className="mt-5 font-['Outfit'] text-2xl font-bold text-slate-900">
              FDA drug labeling data
            </h2>

            <p className="mt-4 font-['DM_Sans'] text-base leading-7 text-slate-600">
              Medicine information on this page is sourced from the U.S. Food
              and Drug Administration (FDA) through the openFDA API. This
              includes drug labeling data submitted by manufacturers and
              includes information about active ingredients, indications,
              dosage, warnings, and other official labeling details.
            </p>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="font-['Outfit'] text-lg font-bold text-slate-900">
                Important notice
              </h3>

              <p className="mt-2 font-['DM_Sans'] text-sm leading-6 text-slate-600">
                Medicine information is provided for educational purposes and
                should not replace advice from a qualified healthcare
                professional. Always consult a doctor or pharmacist before
                starting, stopping, or changing medication.
              </p>
            </div>

            <p className="mt-6 font-['DM_Sans'] text-sm text-slate-500">
              This feature currently provides information about medicines
              available in FDA drug labeling data. Additional sources for
              medicines from other regions can be integrated in the future.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MedicinesPage;
