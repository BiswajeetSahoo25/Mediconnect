import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getNearbyFacilities } from "../services/facility.service";
import {
  geocodeLocation,
  getCurrentLocation,
} from "../services/location.service";
import type { NearbyFacility } from "../types/facility";

export default function HealthcarePage() {
  const [search, setSearch] = useState("");
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const locationLoaded = useRef(false);

  async function loadNearbyFacilities(
    latitude: number,
    longitude: number,
    name: string,
  ) {
    const response = await getNearbyFacilities(latitude, longitude, 5000);

    setFacilities(response.data);
    setLocationName(name);
  }

  useEffect(() => {
    if (locationLoaded.current) {
      return;
    }

    locationLoaded.current = true;

    async function loadCurrentLocation() {
      setLoading(true);
      setError("");

      try {
        const location = await getCurrentLocation();

        await loadNearbyFacilities(
          location.latitude,
          location.longitude,
          "Your current location",
        );
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Unable to get your current location");
        }
      } finally {
        setLoading(false);
      }
    }

    loadCurrentLocation();
  }, []);

  async function handleSearch() {
    const query = search.trim();

    if (!query) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const location = await geocodeLocation(query);

      await loadNearbyFacilities(
        location.latitude,
        location.longitude,
        location.formatted,
      );
    } catch {
      setFacilities([]);
      setError("Unable to find healthcare facilities for this location");
    } finally {
      setLoading(false);
    }
  }

  async function handleCurrentLocation() {
    setLoading(true);
    setError("");

    try {
      const location = await getCurrentLocation();

      await loadNearbyFacilities(
        location.latitude,
        location.longitude,
        "Your current location",
      );
    } catch (error) {
      setFacilities([]);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to get your current location");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-['DM_Sans'] text-sm font-semibold text-teal-600">
              Healthcare Discovery
            </p>

            <h1 className="mt-2 font-['DM_Sans'] text-4xl font-bold text-slate-900">
              Find healthcare near you
            </h1>

            <p className="mt-4 font-['DM_Sans'] text-slate-600">
              Search for hospitals and healthcare facilities around any
              location.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Search city or location"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-['DM_Sans'] text-slate-900 outline-none focus:border-teal-500 sm:flex-1"
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="rounded-xl bg-teal-600 px-6 py-3 font-['DM_Sans'] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-['DM_Sans'] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Use my location
            </button>
          </div>

          {error && (
            <p className="mt-4 font-['DM_Sans'] text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="font-['DM_Sans'] text-lg font-semibold text-slate-900">
                Finding healthcare near you
              </p>

              <p className="mt-2 font-['DM_Sans'] text-sm text-slate-500">
                Getting your location and searching nearby facilities...
              </p>
            </div>
          ) : (
            <>
              {locationName && (
                <div className="mb-6">
                  <h2 className="font-['DM_Sans'] text-2xl font-bold text-slate-900">
                    Healthcare near {locationName}
                  </h2>

                  <p className="mt-1 font-['DM_Sans'] text-sm text-slate-500">
                    Showing facilities within 5 km
                  </p>
                </div>
              )}

              {facilities.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {facilities.map((facility) => {
                    const googleMapsQuery = [
                      facility.name,
                      facility.address,
                      facility.city,
                      facility.state,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    const googleMapsUrl =
                      `https://www.google.com/maps/search/?api=1&query=` +
                      encodeURIComponent(googleMapsQuery);

                    return (
                      <article
                        key={facility.placeId}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <span className="font-['DM_Sans'] text-xs font-semibold uppercase tracking-wide text-teal-600">
                              {facility.type}
                            </span>

                            <Link
                              to={`/healthcare/${encodeURIComponent(
                                facility.placeId,
                              )}`}
                              className="mt-1 block font-['DM_Sans'] text-xl font-bold text-slate-900 hover:text-teal-600"
                            >
                              {facility.name}
                            </Link>
                          </div>

                          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 font-['DM_Sans'] text-sm font-medium text-slate-600">
                            {(facility.distance / 1000).toFixed(1)} km
                          </span>
                        </div>

                        <p className="mt-4 font-['DM_Sans'] text-sm leading-6 text-slate-600">
                          {facility.address}
                        </p>

                        {facility.phone && (
                          <p className="mt-3 font-['DM_Sans'] text-sm text-slate-600">
                            {facility.phone}
                          </p>
                        )}

                        <div className="mt-5 flex items-center gap-5">
                          <Link
                            to={`/healthcare/${encodeURIComponent(
                              facility.placeId,
                            )}`}
                            className="font-['DM_Sans'] text-sm font-semibold text-teal-600 hover:text-teal-700"
                          >
                            View details
                          </Link>

                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-['DM_Sans'] text-sm font-semibold text-slate-600 hover:text-slate-900"
                          >
                            Google Maps
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                locationName && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="font-['DM_Sans'] text-lg font-semibold text-slate-900">
                      No healthcare facilities found
                    </p>

                    <p className="mt-2 font-['DM_Sans'] text-sm text-slate-500">
                      Try searching for another city or location.
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}