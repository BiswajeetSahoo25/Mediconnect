import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctors } from "../services/doctor.service";
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

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [maxFee, setMaxFee] = useState(2000);
  const [sortBy, setSortBy] = useState("relevance");

  const [currentPage, setCurrentPage] = useState(1);

  const doctorsPerPage = 6;

  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoading(true);
        setError(null);

        const response = await getDoctors({
          page: 1,
          limit: 20,
        });

        setDoctors(response.data.items);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setError("Failed to load doctors. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, []);

  const doctorCards = useMemo(() => {
    return doctors.map((doctor, index) => mapDoctorToCard(doctor, index));
  }, [doctors]);

  const specialties = useMemo(() => {
    const values = doctorCards.map((doctor) => doctor.specialty);

    return ["All", ...Array.from(new Set(values))];
  }, [doctorCards]);

  const filteredDoctors = useMemo(() => {
    let result = [...doctorCards];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((doctor) =>
        [doctor.name, doctor.specialty, doctor.experience].some((value) =>
          value.toLowerCase().includes(query),
        ),
      );
    }

    // Specialty
    if (selectedSpecialty !== "All") {
      result = result.filter(
        (doctor) => doctor.specialty === selectedSpecialty,
      );
    }

    // Experience
    if (selectedExperience !== "All") {
      result = result.filter((doctor) => {
        const years = Number.parseInt(doctor.experience);

        switch (selectedExperience) {
          case "0-5":
            return years <= 5;

          case "5-10":
            return years > 5 && years <= 10;

          case "10+":
            return years > 10;

          default:
            return true;
        }
      });
    }

    // Fee
    result = result.filter((doctor) => {
      const fee = Number.parseInt(doctor.fee.replace(/[^\d]/g, ""));

      return Number.isNaN(fee) || fee <= maxFee;
    });

    // Availability
    if (selectedAvailability !== "All") {
      result = result.filter(
        (doctor) => doctor.availabilityType === selectedAvailability,
      );
    }

    // Sorting
    if (sortBy === "experience-high") {
      result.sort((a, b) => {
        const aYears = Number.parseInt(a.experience) || 0;
        const bYears = Number.parseInt(b.experience) || 0;

        return bYears - aYears;
      });
    }

    if (sortBy === "experience-low") {
      result.sort((a, b) => {
        const aYears = Number.parseInt(a.experience) || 0;
        const bYears = Number.parseInt(b.experience) || 0;

        return aYears - bYears;
      });
    }

    if (sortBy === "fee-low") {
      result.sort((a, b) => {
        const aFee = Number.parseInt(a.fee.replace(/[^\d]/g, "")) || 0;

        const bFee = Number.parseInt(b.fee.replace(/[^\d]/g, "")) || 0;

        return aFee - bFee;
      });
    }

    if (sortBy === "fee-high") {
      result.sort((a, b) => {
        const aFee = Number.parseInt(a.fee.replace(/[^\d]/g, "")) || 0;

        const bFee = Number.parseInt(b.fee.replace(/[^\d]/g, "")) || 0;

        return bFee - aFee;
      });
    }

    return result;
  }, [
    doctorCards,
    search,
    selectedSpecialty,
    selectedExperience,
    selectedAvailability,
    maxFee,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDoctors.length / doctorsPerPage),
  );

  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * doctorsPerPage,
    currentPage * doctorsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    selectedSpecialty,
    selectedExperience,
    selectedAvailability,
    maxFee,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSelectedSpecialty("All");
    setSelectedExperience("All");
    setSelectedGender("All");
    setSelectedAvailability("All");
    setMaxFee(2000);
    setSortBy("relevance");
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search doctors or specialties..."
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

            {/* Specialty */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>

              <select
                value={selectedSpecialty}
                onChange={(event) => setSelectedSpecialty(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience
              </label>

              <select
                value={selectedExperience}
                onChange={(event) => setSelectedExperience(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="All">Any experience</option>
                <option value="0-5">0 - 5 Years</option>
                <option value="5-10">5 - 10 Years</option>
                <option value="10+">10+ Years</option>
              </select>
            </div>

            {/* Gender */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>

              <select
                value={selectedGender}
                onChange={(event) => setSelectedGender(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="All">Any gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>

              <p className="mt-2 text-xs text-gray-500">
                Gender filtering will be connected when gender is available in
                the doctor profile data.
              </p>
            </div>

            {/* Availability */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>

              <select
                value={selectedAvailability}
                onChange={(event) =>
                  setSelectedAvailability(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="All">Any availability</option>
                <option value="today">Available Today</option>
                <option value="later">Available Later</option>
              </select>
            </div>

            {/* Fee */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Consultation Fee
                </label>

                <span className="text-sm text-gray-600">₹{maxFee}</span>
              </div>

              <input
                type="range"
                min="500"
                max="2000"
                step="50"
                value={maxFee}
                onChange={(event) => setMaxFee(Number(event.target.value))}
                className="w-full"
              />
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Doctors</h2>

                <p className="text-sm text-gray-500 mt-1">
                  {loading
                    ? "Loading doctors..."
                    : `${filteredDoctors.length} doctors found`}
                </p>
              </div>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 bg-white"
              >
                <option value="relevance">Sort by relevance</option>
                <option value="experience-high">Experience: High to Low</option>
                <option value="experience-low">Experience: Low to High</option>
                <option value="fee-low">Fee: Low to High</option>
                <option value="fee-high">Fee: High to Low</option>
              </select>
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
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && paginatedDoctors.length === 0 && (
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
                {paginatedDoctors.map((doctor) => (
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
                        to={`/doctors/${doctor.id}`}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && filteredDoctors.length > 0 && (
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

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
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
                ))}

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
