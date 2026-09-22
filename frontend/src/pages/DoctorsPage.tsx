import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDoctors,
  getSpecializations,
  type SpecializationOption,
} from "../services/doctor.service";
import type { Doctor } from "../types/doctor";

interface DoctorCard {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  fee: string;
  rating: string;
  reviews: string;
  availability: string;
  availabilityType: "today" | "later";
  avatar?: string;
}

const doctorAvatars = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWH51TBkIysPOb_mRJrwQ3pBtYu3JZvGTxQ4Q9-eHhPyRuhShDyZRsUZf8&s=10",
];

function mapDoctorToCard(doctor: Doctor, index: number): DoctorCard {
  const primarySpecialization =
    doctor.specializations.find((specialization) => specialization.isPrimary) ??
    doctor.specializations[0];

  const primaryFacility = doctor.facilities[0];

  return {
    id: doctor.id,

    name: `Dr. ${doctor.firstName}${
      doctor.lastName ? ` ${doctor.lastName}` : ""
    }`,

    specialty: primarySpecialization?.name ?? "General Physician",

    experience: doctor.yearsOfExperience
      ? `${doctor.yearsOfExperience} Years`
      : "Experience not available",

    fee: primaryFacility
      ? `₹${primaryFacility.consultationFee}`
      : "Fee not available",

    // Reviews/ratings are not currently part of the doctor API response.
    rating: "—",
    reviews: "No reviews",

    // Availability is not yet being calculated from DoctorAvailability.
    availability: "Check availability",
    availabilityType: "later",

    avatar: doctorAvatars[index % doctorAvatars.length],
  };
}

const PAGE_SIZE = 6;

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [specializations, setSpecializations] = useState<
    SpecializationOption[]
  >([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [searchInput, setSearchInput] = useState("");

  // Load specialization options once for the specialty filter.
  useEffect(() => {
    async function fetchSpecializations() {
      try {
        const response = await getSpecializations();

        setSpecializations(response.data);
      } catch (error) {
        // The specialty filter simply stays empty if this fails.
        console.error("Failed to fetch specializations:", error);
      }
    }

    fetchSpecializations();
  }, []);

  const selectedSpecializationId = useMemo(() => {
    if (selectedSpecialty === "All") {
      return undefined;
    }

    return specializations.find(
      (specialization) => specialization.name === selectedSpecialty,
    )?.id;
  }, [selectedSpecialty, specializations]);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getDoctors({
        page: currentPage,
        limit: PAGE_SIZE,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(selectedSpecializationId ? { specializationId: selectedSpecializationId } : {}),
      });

      setDoctors(response.data.items);
      setTotalPages(Math.max(1, response.data.pagination.totalPages));
      setTotalResults(response.data.pagination.total);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      setError("Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedSpecializationId]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const doctorCards = useMemo(() => {
    return doctors.map((doctor, index) => mapDoctorToCard(doctor, index));
  }, [doctors]);

  // Debounced search: only hits the backend after the user stops typing.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentPage(1);
      setSearch(searchInput);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSpecialty]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setSelectedSpecialty("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>

          <p className="mt-2 text-gray-600">
            Find the right doctor for your healthcare needs.
          </p>

          {/* Search */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search doctors by name or license number..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:w-64">
              <input
                type="text"
                value="Mumbai, India"
                readOnly
                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <aside className="bg-white rounded-2xl border p-6 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>

              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear
              </button>
            </div>

            {/* Specialty (backend-supported filter) */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>

              <select
                value={selectedSpecialty}
                onChange={(event) => setSelectedSpecialty(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="All">All specialties</option>

                {specializations.map((specialization) => (
                  <option key={specialization.id} value={specialization.name}>
                    {specialization.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              Experience, gender, availability and fee filters are not
              currently supported by the doctor search API and have been
              removed.
            </p>
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Doctors</h2>

                <p className="text-sm text-gray-500 mt-1">
                  {loading
                    ? "Loading doctors..."
                    : `${totalResults} doctors found`}
                </p>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="bg-white rounded-2xl border p-12 text-center">
                <p className="text-gray-600">Loading doctors...</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-white rounded-2xl border p-12 text-center">
                <p className="text-red-600">{error}</p>

                <button
                  type="button"
                  onClick={fetchDoctors}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && doctorCards.length === 0 && (
              <div className="bg-white rounded-2xl border p-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  No doctors found
                </h3>

                <p className="mt-2 text-gray-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Doctor cards */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctorCards.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                      />

                      {/* Basic info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/doctors/${doctor.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {doctor.name}
                        </Link>

                        <p className="mt-1 text-blue-600 font-medium">
                          {doctor.specialty}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {doctor.experience}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Consultation
                        </span>

                        <span className="font-semibold text-gray-900">
                          {doctor.fee}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Rating</span>

                        <span className="text-sm text-gray-700">
                          {doctor.rating}{" "}
                          {doctor.reviews !== "No reviews" &&
                            `(${doctor.reviews})`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Availability
                        </span>

                        <span
                          className={`text-sm font-medium ${
                            doctor.availabilityType === "today"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {doctor.availability}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        View Profile
                      </Link>

                      <Link
                        to={`/doctors/${doctor.id}/book`}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination (backend-driven) */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-4 py-2 text-sm ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 bg-white text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
