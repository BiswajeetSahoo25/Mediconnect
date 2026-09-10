import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getFacilityDetails } from "../services/facility.service";
import type { FacilityDetails } from "../types/facility";

export default function HealthcareDetailsPage() {
  const { placeId } = useParams<{ placeId: string }>();

  const [facility, setFacility] = useState<FacilityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFacility() {
      if (!placeId) {
        setError("Healthcare facility not found");
        setLoading(false);
        return;
      }

      try {
        const response = await getFacilityDetails(placeId);
        setFacility(response.data);
      } catch {
        setError("Unable to load healthcare facility details");
      } finally {
        setLoading(false);
      }
    }

    loadFacility();
  }, [placeId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="font-['DM_Sans'] text-slate-600">
              Loading facility details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !facility) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="font-['DM_Sans'] text-red-600">
              {error || "Healthcare facility not found"}
            </p>

            <Link
              to="/healthcare"
              className="mt-4 inline-block font-['DM_Sans'] text-sm font-semibold text-teal-600"
            >
              ← Back to healthcare
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
    <main className="min-h-screen bg-slate-50">
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
          <Link
            to="/healthcare"
            className="font-['DM_Sans'] text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            ← Back to healthcare
          </Link>

          <div className="mt-8">
            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 font-['DM_Sans'] text-xs font-semibold uppercase tracking-wide text-teal-700">
              Healthcare Facility
            </span>

            <h1 className="mt-4 font-['DM_Sans'] text-4xl font-bold leading-tight text-slate-900">
              {facility.name}
            </h1>

            <div className="mt-4 flex items-start gap-2">
              <span className="mt-1 text-teal-600">📍</span>

              <p className="font-['DM_Sans'] leading-7 text-slate-600">
                {facility.address}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-teal-600 px-5 py-3 font-['DM_Sans'] text-sm font-semibold text-white hover:bg-teal-700"
              >
                Open in Google Maps
              </a>

              {facility.website && (
                <a
                  href={facility.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-['DM_Sans'] text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Visit Website
                </a>
              )}

              {facility.phone && (
                <a
                  href={`tel:${facility.phone}`}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-['DM_Sans'] text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Call Facility
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-['DM_Sans'] text-xl font-bold text-slate-900">
                Contact Information
              </h2>

              <div className="mt-5 space-y-4 font-['DM_Sans'] text-sm">
                {facility.phone ? (
                  <div>
                    <p className="text-slate-400">Phone</p>
                    <a
                      href={`tel:${facility.phone}`}
                      className="mt-1 block font-medium text-slate-700 hover:text-teal-600"
                    >
                      {facility.phone}
                    </a>
                  </div>
                ) : null}

                {facility.email ? (
                  <div>
                    <p className="text-slate-400">Email</p>
                    <a
                      href={`mailto:${facility.email}`}
                      className="mt-1 block font-medium text-slate-700 hover:text-teal-600"
                    >
                      {facility.email}
                    </a>
                  </div>
                ) : null}

                {facility.website ? (
                  <div>
                    <p className="text-slate-400">Website</p>
                    <a
                      href={facility.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all font-medium text-teal-600"
                    >
                      {facility.website}
                    </a>
                  </div>
                ) : null}

                {!facility.phone && !facility.email && !facility.website && (
                  <p className="text-slate-500">
                    Contact information is not available.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-['DM_Sans'] text-xl font-bold text-slate-900">
                Location
              </h2>

              <div className="mt-5 space-y-4 font-['DM_Sans'] text-sm">
                {facility.city && (
                  <div>
                    <p className="text-slate-400">City</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {facility.city}
                    </p>
                  </div>
                )}

                {facility.state && (
                  <div>
                    <p className="text-slate-400">State</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {facility.state}
                    </p>
                  </div>
                )}

                {facility.country && (
                  <div>
                    <p className="text-slate-400">Country</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {facility.country}
                    </p>
                  </div>
                )}

                {facility.pincode && (
                  <div>
                    <p className="text-slate-400">Pincode</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {facility.pincode}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {facility.openingHours && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-['DM_Sans'] text-xl font-bold text-slate-900">
                Opening Hours
              </h2>

              <p className="mt-4 whitespace-pre-line font-['DM_Sans'] text-sm leading-7 text-slate-600">
                {facility.openingHours}
              </p>
            </section>
          )}

          {facility.description && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-['DM_Sans'] text-xl font-bold text-slate-900">
                About this facility
              </h2>

              <p className="mt-4 font-['DM_Sans'] leading-7 text-slate-600">
                {facility.description}
              </p>
            </section>
          )}

          {(facility.wheelchairAccessible !== undefined ||
            facility.toiletsAvailable !== undefined) && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-['DM_Sans'] text-xl font-bold text-slate-900">
                Facilities & Accessibility
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
                {facility.wheelchairAccessible !== undefined && (
                  <span className="rounded-full bg-slate-100 px-4 py-2 font-['DM_Sans'] text-sm text-slate-700">
                    {facility.wheelchairAccessible
                      ? "Wheelchair accessible"
                      : "Wheelchair accessibility unavailable"}
                  </span>
                )}

                {facility.toiletsAvailable !== undefined && (
                  <span className="rounded-full bg-slate-100 px-4 py-2 font-['DM_Sans'] text-sm text-slate-700">
                    {facility.toiletsAvailable
                      ? "Toilets available"
                      : "Toilets unavailable"}
                  </span>
                )}
              </div>
            </section>
          )}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 p-5">
            <p className="font-['DM_Sans'] text-sm leading-6 text-slate-600">
              This is an external healthcare listing discovered through
              MediConnect. Availability, contact information, services, and
              other facility details should be confirmed with the facility
              directly.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
