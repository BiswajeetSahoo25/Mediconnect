import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMedicineById } from "../services/medicine.service";
import type { MedicineDetail } from "../types/medicine";
import { getMedicineImage, getMedicineImageAlt } from "../utils/medicineImage";

// ---------------------------------------------------------------------------
// FDA text formatting
// ---------------------------------------------------------------------------

/** Strips a redundant section heading when it exactly matches the UI section title. */
function stripRedundantHeading(text: string, sectionTitle: string): string {
  const normalized = sectionTitle.toUpperCase().replace(/\s+/g, " ").replace(/[./]/g, "");
  const lines = text.split("\n");
  const first = lines[0]?.trim();
  if (!first) return text;

  const candidate = first.replace(/^\d+\s*/, "").replace(/[:.\-]\s*$/, "").replace(/\s+/g, " ");
  if (candidate === normalized) {
    return lines.slice(1).join("\n").trim();
  }
  return text;
}

/** Turns an FDA label string into structured blocks: paragraphs and lists. */
function formatFDA(text: string, sectionTitle: string): Array<{ kind: "p"; text: string } | { kind: "ul"; items: string[] }> {
  const cleaned = stripRedundantHeading(text, sectionTitle);
  if (!cleaned) return [];

  const blocks: Array<{ kind: "p"; text: string } | { kind: "ul"; items: string[] }> = [];
  const paragraphs = cleaned.split(/\n\s*\n/);

  for (const raw of paragraphs) {
    const block = raw.trim();
    if (!block) continue;

    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    if (lines.length === 1) {
      blocks.push({ kind: "p", text: lines[0] });
      continue;
    }

    const listItems: string[] = [];
    let allListLike = true;

    for (const line of lines) {
      let item = line
        .replace(/^\d+\.\s+/, "")
        .replace(/^[•\-*]\s+/, "")
        .trim();

      if (!item) {
        allListLike = false;
        break;
      }
      listItems.push(item);
    }

    if (allListLike && listItems.length > 0) {
      blocks.push({ kind: "ul", items: listItems });
    } else {
      for (const line of lines) {
        blocks.push({ kind: "p", text: line });
      }
    }
  }

  return blocks;
}

function renderFDA(blocks: Array<{ kind: "p"; text: string } | { kind: "ul"; items: string[] }>): React.ReactNode {
  return blocks.map((block, i) => {
    if (block.kind === "p") {
      return <p key={i} className="mb-3 last:mb-0">{block.text}</p>;
    }
    return (
      <ul key={i} className="mb-3 last:mb-0 list-disc pl-5">
        {block.items.map((item, j) => (
          <li key={j}>{item}</li>
        ))}
      </ul>
    );
  });
}

// ---------------------------------------------------------------------------
// Section component — full-width accordion
// ---------------------------------------------------------------------------

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  tone?: "neutral" | "caution" | "danger" | "info";
}

function Section({ icon, title, children, tone = "neutral" }: SectionProps) {
  const [open, setOpen] = useState(true);

  const tintClass = {
    neutral: "border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900",
    caution: "border-amber-200 hover:bg-amber-50 text-amber-800 hover:text-amber-900",
    danger:  "border-red-200 hover:bg-red-50 text-red-800 hover:text-red-900",
    info:    "border-blue-200 hover:bg-blue-50 text-blue-800 hover:text-blue-900",
  }[tone]!;

  return (
    <div className={`rounded-lg border ${tintClass}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition"
        aria-expanded={open}
      >
        <span className="shrink-0">{icon}</span>
        <h2 className="flex-1 font-['Outfit'] text-sm font-bold uppercase tracking-wide">
          {title}
        </h2>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function MedicineDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [medicine, setMedicine] = useState<MedicineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setNotFound(false);
        setError(null);
        const response = await getMedicineById(id as string);
        setMedicine(response.data);
      } catch (err) {
        if (err instanceof Error && "statusCode" in err && (err as { statusCode?: number }).statusCode === 404) {
          setNotFound(true);
        } else {
          setError("Unable to load medicine information. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // ---- Loading ---------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="font-['DM_Sans'] text-sm text-slate-500">Loading medicine information…</p>
      </div>
    );
  }

  // ---- Not found ------------------------------------------------------
  if (notFound || !medicine || !medicine.name) {
    return (
      <div className="min-h-screen bg-white px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-['Outfit'] text-5xl font-extrabold text-slate-200">404</p>
          <h1 className="mt-4 font-['Outfit'] text-2xl font-bold text-slate-900">Medicine not found</h1>
          <p className="mt-2 font-['DM_Sans'] text-sm text-slate-500">
            This medicine is not available in FDA drug labeling data, or the identifier may be incorrect.
          </p>
          <Link
            to="/medicines"
            className="mt-5 inline-flex h-9 items-center rounded-lg bg-[#1a73e8] px-4 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Browse medicines
          </Link>
        </div>
      </div>
    );
  }

  // ---- Error ----------------------------------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-white px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-['Outfit'] text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-2 font-['DM_Sans'] text-sm text-slate-500">{error}</p>
          <Link
            to="/medicines"
            className="mt-5 inline-flex h-9 items-center rounded-lg bg-[#1a73e8] px-4 font-['DM_Sans'] text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Medicines
          </Link>
        </div>
      </div>
    );
  }

  // ---- Helpers --------------------------------------------------------
  const displayName = medicine.name
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const formatGeneric = (value?: string) =>
    value
      ? value
          .split(/[-\s]+/)
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
      : undefined;

  const hasData = <T extends string | string[] | null | undefined>(
    v: T,
  ): v is Exclude<T, null | undefined> =>
    Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim().length > 0 : false;

  // ---- Render ---------------------------------------------------------
  return (
    <div className="bg-white">
      {/* Top bar */}
      <div className="border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link
            to="/medicines"
            className="flex items-center gap-1.5 font-['DM_Sans'] text-sm text-slate-500 transition hover:text-[#1a73e8]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
            </svg>
            Medicines
          </Link>
          <span className="font-['DM_Sans'] text-xs text-slate-400">{medicine.source} drug information</span>
        </div>
      </div>

      {/* Main content — wide container */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Medicine header with image */}
        <header className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start">
            {/* Medicine image */}
            <div className="shrink-0">
              <img
                src={getMedicineImage(medicine.name)}
                alt={getMedicineImageAlt(medicine.name)}
                className="h-20 w-20 rounded-lg object-cover shadow-sm"
              />
            </div>

            <div className="flex-1">
              {/* Source chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#1a73e8]/10 px-2.5 py-1 font-['DM_Sans'] text-xs font-semibold text-[#1a73e8]">
                  {medicine.source}
                </span>
                {medicine.dosageForm && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-['DM_Sans'] text-xs text-slate-500 shadow-sm">
                    {medicine.dosageForm}
                  </span>
                )}
                {medicine.route && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-['DM_Sans'] text-xs text-slate-500 shadow-sm">
                    {medicine.route}
                  </span>
                )}
                {medicine.productType && (
                  <span className="rounded-full bg-white px-2.5 py-1 font-['DM_Sans'] text-xs text-slate-500 shadow-sm">
                    {medicine.productType}
                  </span>
                )}
              </div>

              {/* Medicine name */}
              <h1 className="mt-3 font-['Outfit'] text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                {displayName}
              </h1>

              {/* Metadata */}
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 font-['DM_Sans'] text-sm text-slate-500">
                {medicine.genericName && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Generic:</span>
                    <span className="font-medium text-slate-700">{formatGeneric(medicine.genericName)}</span>
                  </div>
                )}
                {medicine.brandName && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Brand:</span>
                    <span className="font-medium text-slate-700">{medicine.brandName}</span>
                  </div>
                )}
                {medicine.manufacturer && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Manufacturer:</span>
                    <span className="font-medium text-slate-700">{medicine.manufacturer}</span>
                  </div>
                )}
                {medicine.route && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Route:</span>
                    <span className="font-medium text-slate-700">{medicine.route}</span>
                  </div>
                )}
                {medicine.dosageForm && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Form:</span>
                    <span className="font-medium text-slate-700">{medicine.dosageForm}</span>
                  </div>
                )}
                {medicine.productType && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Type:</span>
                    <span className="font-medium text-slate-700">{medicine.productType}</span>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </header>

        {/* Quick ingredient summary */}
        {hasData(medicine.activeIngredients) && (
          <div className="mb-8 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="flex items-center gap-2 font-['Outfit'] text-sm font-bold uppercase tracking-wide text-slate-800">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#1a73e8]" aria-hidden="true">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
              </svg>
              Active Ingredients
            </h2>
            <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
              {medicine.activeIngredients!.map((ingredient) => (
                <li
                  key={ingredient}
                  className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1a73e8]" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Medical information sections ── */}
        <div className="mb-8 space-y-4">
          {hasData(medicine.indications) && (
            <Section icon={<InfoDocIcon />} title="Uses / Indications" tone="info">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.indications, "Uses / Indications"))}</div>
            </Section>
          )}

          {hasData(medicine.dosageAndAdministration) && (
            <Section icon={<DosageIcon />} title="Dosage & Administration" tone="info">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.dosageAndAdministration, "Dosage & Administration"))}</div>
            </Section>
          )}

          {hasData(medicine.warnings) && (
            <Section icon={<WarningIcon />} title="Warnings" tone="caution">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.warnings, "Warnings"))}</div>
            </Section>
          )}

          {hasData(medicine.contraindications) && (
            <Section icon={<CrossIcon />} title="Contraindications" tone="danger">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.contraindications, "Contraindications"))}</div>
            </Section>
          )}

          {hasData(medicine.adverseReactions) && (
            <Section icon={<ArrowBraceIcon />} title="Side Effects / Adverse Reactions" tone="caution">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.adverseReactions, "Side Effects / Adverse Reactions"))}</div>
            </Section>
          )}

          {hasData(medicine.drugInteractions) && (
            <Section icon={<InteractIcon />} title="Drug Interactions" tone="info">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.drugInteractions, "Drug Interactions"))}</div>
            </Section>
          )}

          {hasData(medicine.doNotUse) && (
            <Section icon={<CrossCircleIcon />} title="Do Not Use" tone="danger">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.doNotUse, "Do Not Use"))}</div>
            </Section>
          )}

          {hasData(medicine.askDoctor) && (
            <Section icon={<AskIcon />} title="Ask Your Doctor" tone="info">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.askDoctor, "Ask Your Doctor"))}</div>
            </Section>
          )}

          {hasData(medicine.askDoctorOrPharmacist) && (
            <Section icon={<AskIcon />} title="Ask Doctor or Pharmacist" tone="info">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.askDoctorOrPharmacist, "Ask Doctor or Pharmacist"))}</div>
            </Section>
          )}

          {hasData(medicine.stopUse) && (
            <Section icon={<StopIcon />} title="Stop Use" tone="danger">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.stopUse, "Stop Use"))}</div>
            </Section>
          )}

          {hasData(medicine.pregnancyOrBreastfeeding) && (
            <Section icon={<PregnantIcon />} title="Pregnancy / Breastfeeding" tone="info">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.pregnancyOrBreastfeeding, "Pregnancy / Breastfeeding"))}</div>
            </Section>
          )}

          {hasData(medicine.storageAndHandling) && (
            <Section icon={<StorageIcon />} title="Storage & Handling" tone="neutral">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.storageAndHandling, "Storage & Handling"))}</div>
            </Section>
          )}

          {hasData(medicine.keepOutOfReachOfChildren) && (
            <Section icon={<ChildIcon />} title="Keep Out of Reach of Children" tone="caution">
              <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.keepOutOfReachOfChildren, "Keep Out of Reach of Children"))}</div>
            </Section>
          )}

          {/* ── Product / Label information (separate section) ── */}
          {(hasData(medicine.pharmClassMoa) || hasData(medicine.pharmClassPe) || hasData(medicine.pharmClassCs) || hasData(medicine.principalDisplayPanel)) && (
            <>
              {(hasData(medicine.pharmClassMoa) || hasData(medicine.pharmClassPe) || hasData(medicine.pharmClassCs)) && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h2 className="mb-3 flex items-center gap-2 font-['Outfit'] text-sm font-bold uppercase tracking-wide text-slate-800">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-400" aria-hidden="true">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13 16h-4m0 0v-4m4 4h.01" />
                    </svg>
                    Pharmaceutical Class
                  </h2>
                  <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {medicine.pharmClassMoa && (
                      <div>
                        <dt className="font-['DM_Sans'] text-xs font-medium text-slate-500">Mechanism of Action</dt>
                        <dd className="mt-0.5 font-['DM_Sans'] text-sm text-slate-700">{medicine.pharmClassMoa}</dd>
                      </div>
                    )}
                    {medicine.pharmClassPe && (
                      <div>
                        <dt className="font-['DM_Sans'] text-xs font-medium text-slate-500">Pharmacologic Class</dt>
                        <dd className="mt-0.5 font-['DM_Sans'] text-sm text-slate-700">{medicine.pharmClassPe}</dd>
                      </div>
                    )}
                    {medicine.pharmClassCs && (
                      <div>
                        <dt className="font-['DM_Sans'] text-xs font-medium text-slate-500">Chemical Class</dt>
                        <dd className="mt-0.5 font-['DM_Sans'] text-sm text-slate-700">{medicine.pharmClassCs}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {hasData(medicine.principalDisplayPanel) && (
                <Section icon={<LabelIcon />} title="Product Information (Label)" tone="neutral">
                  <div className="text-sm leading-relaxed text-slate-600">{renderFDA(formatFDA(medicine.principalDisplayPanel, "Product Information (Label)"))}</div>
                </Section>
              )}
            </>
          )}
        </div>

        {/* Inactive Ingredients (when present) */}
        {hasData(medicine.inactiveIngredients) && (
          <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h2 className="mb-3 flex items-center gap-2 font-['Outfit'] text-sm font-bold uppercase tracking-wide text-slate-800">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-400" aria-hidden="true">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
              Inactive Ingredients
            </h2>
            <p className="font-['DM_Sans'] text-sm text-slate-600">{(medicine.inactiveIngredients ?? []).join(", ")}</p>
          </div>
        )}

        {/* Important notice */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
            <p className="font-['DM_Sans'] text-sm leading-relaxed text-amber-800">
              This medicine information is sourced from the U.S. Food and Drug Administration (FDA) through the
              openFDA API. It is provided for educational and informational purposes only and should not replace
              professional medical advice. Always consult a doctor or pharmacist before starting, stopping, or
              changing any medication.
            </p>
          </div>
        </div>

        <p className="mt-4 font-['DM_Sans'] text-xs text-slate-400">
          Source: U.S. FDA drug labeling data via openFDA.
        </p>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons (inline, typed)
// ---------------------------------------------------------------------------

function InfoDocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#1a73e8]" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3L22 4" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function DosageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#1a73e8]" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-amber-500" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-red-500" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 1 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
    </svg>
  );
}

function ArrowBraceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-amber-500" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

function InteractIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#1a73e8]" aria-hidden="true">
      <circle cx="7" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9.5 12h5m-2.5-2.5 1.5 1.5M11 9.5 12.5 8m-1 4.5 1.5-1.5" />
    </svg>
  );
}

function CrossCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-red-500" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6m0-6-6 6" />
    </svg>
  );
}

function AskIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#1a73e8]" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-9-9" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-red-500" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 9 3 3m0-3-3 3" />
    </svg>
  );
}

function PregnantIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#1a73e8]" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.31 1.51 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function StorageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-400" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6" />
    </svg>
  );
}

function ChildIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-amber-500" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 13a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" />
    </svg>
  );
}

function LabelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-400" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M9 21V9" />
    </svg>
  );
}

export default MedicineDetailsPage;
