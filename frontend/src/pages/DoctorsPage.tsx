import { useState, type Dispatch, type SetStateAction } from "react";

const doctorAvatars = [
  "https://www.figma.com/api/mcp/asset/6a350711-9696-4cf2-9d3f-faca5db465be.png",
  "https://www.figma.com/api/mcp/asset/cd6d1b8f-40c7-4da6-bdbc-da7b753cc50e.png",
  "https://www.figma.com/api/mcp/asset/a4303fdb-d84f-4516-afdd-539a51762cc6.png",
  "https://www.figma.com/api/mcp/asset/28286535-5751-4af5-8e5a-71aa5e81ec5e.png",
  "https://www.figma.com/api/mcp/asset/d8db1c5c-cd4e-4c5d-a22b-f27918db3242.png",
  "https://www.figma.com/api/mcp/asset/e1daacc9-0742-4ee5-8d3c-7910bb3a5d03.png",
];

const searchIcon =
  "https://www.figma.com/api/mcp/asset/a314ced4-0455-4544-a14a-8ac9ab7cc081.svg";

const stethoscopeIcon =
  "https://www.figma.com/api/mcp/asset/aba09a7c-fe7c-4996-a864-a46789fb2835.svg";

const mapPinIcon =
  "https://www.figma.com/api/mcp/asset/280e0c9e-f078-4d5e-a432-7d143569ac3d.svg";

const calendarIcon =
  "https://www.figma.com/api/mcp/asset/79322904-2428-44b8-873c-8fe1bcc25a10.svg";

const starIcon =
  "https://www.figma.com/api/mcp/asset/4d1aeff1-1dc0-4ecf-9c59-29e1804c23a6.svg";

const doctors = [
  {
    name: "Dr. Ananya Sharma",
    specialty: "Cardiologist",
    experience: "14 Years",
    fee: "₹800",
    rating: "4.9",
    reviews: "142",
    availability: "Available Today",
    availabilityType: "today",
    avatar: doctorAvatars[0],
  },
  {
    name: "Dr. Aarav Mehta",
    specialty: "Dermatologist",
    experience: "10 Years",
    fee: "₹600",
    rating: "4.8",
    reviews: "98",
    availability: "Available Today",
    availabilityType: "today",
    avatar: doctorAvatars[1],
  },
  {
    name: "Dr. Rohan Iyer",
    specialty: "Pediatrician",
    experience: "12 Years",
    fee: "₹700",
    rating: "4.7",
    reviews: "110",
    availability: "Available Tomorrow",
    availabilityType: "tomorrow",
    avatar: doctorAvatars[2],
  },
  {
    name: "Dr. Priya Nair",
    specialty: "Gynecologist",
    experience: "15 Years",
    fee: "₹900",
    rating: "4.9",
    reviews: "185",
    availability: "Available Today",
    availabilityType: "today",
    avatar: doctorAvatars[3],
  },
  {
    name: "Dr. Vikram Singh",
    specialty: "General Physician",
    experience: "18 Years",
    fee: "₹500",
    rating: "4.6",
    reviews: "210",
    availability: "Available Today",
    availabilityType: "today",
    avatar: doctorAvatars[4],
  },
  {
    name: "Dr. Neha Kapoor",
    specialty: "Endocrinologist",
    experience: "16 Years",
    fee: "₹850",
    rating: "4.8",
    reviews: "74",
    availability: "Available Tomorrow",
    availabilityType: "tomorrow",
    avatar: doctorAvatars[5],
  },
];
const specialties = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Gynecologist",
];

const experiences = ["1 - 5 Years", "5 - 10 Years", "10+ Years"];

const genders = ["Male Doctors", "Female Doctors", "Any"];

function SearchIcon() {
  return <img src={searchIcon} alt="" className="h-4 w-4 shrink-0" />;
}

function FilterIcon({ src }: { src: string }) {
  return <img src={src} alt="" className="h-3.5 w-3.5 shrink-0" />;
}

function Checkbox({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition ${
        checked
          ? "border-[#0e56c5] bg-[#0e56c5]"
          : "border-[#e2e8f0] bg-white hover:border-[#0e56c5]"
      }`}
    >
      {checked && (
        <svg
          viewBox="0 0 12 12"
          className="h-2.5 w-2.5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m2 6 2.5 2.5L10 3" />
        </svg>
      )}
    </button>
  );
}

function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState([
    "General Physician",
    "Cardiologist",
  ]);
  const [selectedExperiences, setSelectedExperiences] = useState(["10+ Years"]);
  const [selectedGenders, setSelectedGenders] = useState(["Female Doctors"]);
  const [sortBy, setSortBy] = useState("Popularity");
  const [page, setPage] = useState(1);

  function toggleSelection(
    value: string,
    setSelected: Dispatch<SetStateAction<string[]>>,
  ) {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }
  function clearFilters() {
    setSelectedSpecialties([]);
    setSelectedExperiences([]);
    setSelectedGenders([]);
  }

  const visibleDoctors = doctors.filter((doctor) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return (
      doctor.name.toLowerCase().includes(searchValue) ||
      doctor.specialty.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div
      data-node-id="25:29"
      className="min-h-[calc(100vh-72px)] bg-[#f4f7fb] px-5 py-8 lg:px-8"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        {/* Header */}
        <section className="flex items-center justify-between">
          <div>
            <h1 className="font-['Outfit'] text-2xl font-bold text-[#1e293b]">
              Find Your Doctor
            </h1>

            <p className="mt-1 text-sm text-[#64748b]">
              Book trusted appointments with top-rated medical experts
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#e2e8f0] bg-white p-1.5 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f0fe] text-sm font-semibold text-[#0e56c5]">
              R
            </div>

            <span className="pr-2 text-[13px] font-semibold text-[#1e293b]">
              Rahul K.
            </span>
          </div>
        </section>

        {/* Search and filters */}
        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase leading-tight text-[#64748b]">
                Search Doctor, Symptoms or Health Condition
              </label>

              <div className="flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f4f7fb] px-3">
                <SearchIcon />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="e.g. Cardiologist, Sarah, Chest Pain..."
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-[#1e293b] outline-none placeholder:text-[#64748b]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-[#64748b]">
                Specialty
              </label>

              <div className="flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3">
                <FilterIcon src={stethoscopeIcon} />

                <span className="flex-1 text-[13px] font-medium text-[#1e293b]">
                  All Specialties
                </span>

                <span className="text-xs text-[#64748b]">⌄</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-[#64748b]">
                Location
              </label>

              <div className="flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3">
                <FilterIcon src={mapPinIcon} />

                <span className="flex-1 truncate text-[13px] font-medium text-[#1e293b]">
                  New Delhi, India
                </span>

                <span className="text-xs text-[#64748b]">⌄</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase text-[#64748b]">
                Availability
              </label>

              <div className="flex h-[38px] items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3">
                <FilterIcon src={calendarIcon} />

                <span className="flex-1 text-[13px] font-medium text-[#1e293b]">
                  Any Day
                </span>

                <span className="text-xs text-[#64748b]">⌄</span>
              </div>
            </div>

            <button
              type="button"
              className="h-[38px] self-end rounded-lg bg-[#0e56c5] px-6 text-[13px] font-semibold text-white transition hover:bg-[#0b49a8]"
            >
              Search
            </button>
          </div>
        </section>

        {/* Main workspace */}
        <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Filters */}
          <aside className="rounded-2xl border border-[#e2e8f0] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1e293b]">
                Filters
              </h2>

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-[#0e56c5] hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="my-5 border-t border-[#e2e8f0]" />

            <div>
              <h3 className="text-[13px] font-semibold uppercase text-[#1e293b]">
                Specialty
              </h3>

              <div className="mt-3 space-y-3">
                {specialties.map((specialty) => (
                  <label
                    key={specialty}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      checked={selectedSpecialties.includes(specialty)}
                      onClick={() =>
                        toggleSelection(specialty, setSelectedSpecialties)
                      }
                    />

                    <span className="text-[13px] text-[#1e293b]">
                      {specialty}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="my-5 border-t border-[#e2e8f0]" />

            <div>
              <h3 className="text-[13px] font-semibold uppercase text-[#1e293b]">
                Experience
              </h3>

              <div className="mt-3 space-y-3">
                {experiences.map((experience) => (
                  <label
                    key={experience}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      checked={selectedExperiences.includes(experience)}
                      onClick={() =>
                        toggleSelection(experience, setSelectedExperiences)
                      }
                    />

                    <span className="text-[13px] text-[#1e293b]">
                      {experience}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="my-5 border-t border-[#e2e8f0]" />

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold uppercase text-[#1e293b]">
                  Consultation Fee
                </h3>

                <span className="text-xs font-semibold text-[#0e56c5]">
                  ₹300 - ₹1000
                </span>
              </div>

              <div className="relative mt-5 h-5">
                <div className="absolute left-0 right-0 top-2 h-1 rounded-full bg-[#e2e8f0]" />

                <div className="absolute left-[15%] right-[15%] top-2 h-1 rounded-full bg-[#0e56c5]" />

                <div className="absolute left-[12%] top-0 h-5 w-5 rounded-full border-2 border-[#0e56c5] bg-white" />

                <div className="absolute right-[12%] top-0 h-5 w-5 rounded-full border-2 border-[#0e56c5] bg-white" />
              </div>
            </div>

            <div className="my-5 border-t border-[#e2e8f0]" />

            <div>
              <h3 className="text-[13px] font-semibold uppercase text-[#1e293b]">
                Gender
              </h3>

              <div className="mt-3 space-y-3">
                {genders.map((gender) => (
                  <label
                    key={gender}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      checked={selectedGenders.includes(gender)}
                      onClick={() =>
                        toggleSelection(gender, setSelectedGenders)
                      }
                    />

                    <span className="text-[13px] text-[#1e293b]">{gender}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-[#64748b]">
                Showing{" "}
                <span className="font-bold text-[#1e293b]">
                  {visibleDoctors.length * 24} Doctors
                </span>{" "}
                in New Delhi
              </p>

              <label className="flex items-center gap-1 text-[13px] text-[#64748b]">
                Sort By:
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="cursor-pointer border-none bg-transparent font-semibold text-[#0e56c5] outline-none"
                >
                  <option>Popularity</option>
                  <option>Rating</option>
                  <option>Experience</option>
                  <option>Fee: Low to High</option>
                </select>
              </label>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              {visibleDoctors.map((doctor) => (
                <article
                  key={doctor.name}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_4px_8px_rgba(14,86,197,0.04)]"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.avatar}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-full object-cover"
                      />

                      <div className="min-w-0">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            doctor.availabilityType === "today"
                              ? "bg-[#e6f7f0] text-[#10b981]"
                              : "bg-[#e8f0fe] text-[#0e56c5]"
                          }`}
                        >
                          {doctor.availability}
                        </span>

                        <h3 className="mt-1 truncate text-base font-semibold text-[#1e293b]">
                          {doctor.name}
                        </h3>

                        <p className="text-[13px] font-medium text-[#0e56c5]">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>

                    <div className="my-3 border-t border-[#e2e8f0]" />

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[11px] text-[#64748b]">Experience</p>

                        <p className="mt-0.5 text-[13px] font-semibold text-[#1e293b]">
                          {doctor.experience}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-[#64748b]">
                          Consultation Fee
                        </p>

                        <p className="mt-0.5 text-[13px] font-semibold text-[#1e293b]">
                          {doctor.fee}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-[#64748b]">Rating</p>

                        <div className="mt-0.5 flex items-center gap-1">
                          <img src={starIcon} alt="" className="h-3 w-3" />

                          <span className="text-[13px] font-semibold text-[#1e293b]">
                            {doctor.rating}
                          </span>

                          <span className="text-[11px] text-[#64748b]">
                            ({doctor.reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#e2e8f0] bg-[#f4f7fb] p-3">
                    <button
                      type="button"
                      className="w-full rounded-lg bg-[#0e56c5] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0b49a8]"
                    >
                      Book Appointment
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <p className="text-[13px] text-[#64748b]">Page {page} of 12</p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e8f0] bg-white text-[#64748b] transition hover:border-[#0e56c5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ‹
                </button>

                {[1, 2, 3].map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border text-[13px] font-medium transition ${
                      page === number
                        ? "border-[#0e56c5] bg-[#0e56c5] text-white"
                        : "border-[#e2e8f0] bg-white text-[#1e293b] hover:border-[#0e56c5]"
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(12, current + 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e8f0] bg-white text-[#64748b] transition hover:border-[#0e56c5]"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorsPage;
