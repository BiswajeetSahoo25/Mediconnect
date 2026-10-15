import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError } from "../../../services/api";
import {
  createMedicalDocument,
  deleteMedicalDocument,
  downloadMedicalDocument,
  getMedicalDocuments,
  MEDICAL_DOCUMENT_TYPES,
  type MedicalDocument,
  type MedicalDocumentType,
} from "../services/medical-record.service";

const DOCUMENT_TYPE_LABELS: Record<MedicalDocumentType, string> = {
  LAB_REPORT: "Lab report",
  IMAGING: "Imaging",
  PRESCRIPTION: "Prescription",
  DISCHARGE_SUMMARY: "Discharge summary",
  REFERRAL: "Referral",
  OTHER: "Other",
};

const MIME_BY_EXTENSION: Record<
  string,
  "application/pdf" | "image/jpeg" | "image/png" | "image/webp"
> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("We could not read this file."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("We could not read this file."));
        return;
      }
      const content = reader.result.split(",", 2)[1];
      if (!content) {
        reject(new Error("This file could not be prepared for upload."));
        return;
      }
      resolve(content);
    };
    reader.readAsDataURL(file);
  });
}

function formatFileSize(value: number | null) {
  if (!value) return "File size unavailable";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function recordErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
}

function MedicalDocumentCard({
  document,
  onDelete,
  onView,
  onDownload,
  deleting,
  viewing,
  downloading,
}: {
  document: MedicalDocument;
  onDelete: (document: MedicalDocument) => void;
  onView: (document: MedicalDocument) => void;
  onDownload: (document: MedicalDocument) => void;
  deleting: boolean;
  viewing: boolean;
  downloading: boolean;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span
          aria-hidden="true"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M6 3.75h8l4 4v12.5H6z" />
            <path d="M14 4v4h4M9 13h6M9 16.5h6" />
          </svg>
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-900">
            {document.fileName}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
              {DOCUMENT_TYPE_LABELS[document.documentType]}
            </span>
            <span>{formatDate(document.createdAt)}</span>
            <span>{formatFileSize(document.fileSize)}</span>
            {document.isVerified && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:pl-4">
        <button
          type="button"
          onClick={() => onView(document)}
          disabled={viewing}
          className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 disabled:opacity-50"
        >
          {viewing ? "Opening…" : "View"}
        </button>
        <button
          type="button"
          onClick={() => onDownload(document)}
          disabled={downloading}
          className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 disabled:opacity-50"
        >
          {downloading ? "Preparing…" : "Download"}
        </button>
        {!document.isVerified && (
          <button
            type="button"
            onClick={() => onDelete(document)}
            disabled={deleting}
            className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
          >
            {deleting ? "Removing…" : "Remove"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function MedicalRecordsPage() {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] =
    useState<MedicalDocumentType>("LAB_REPORT");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    document: MedicalDocument;
    url: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!preview) return;
    const url = preview.url;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setPreview(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      URL.revokeObjectURL(url);
    };
  }, [preview]);

  useEffect(() => {
    let isCurrent = true;
    void Promise.resolve()
      .then(getMedicalDocuments)
      .then((response) => {
        if (isCurrent) {
          setDocuments(response.data);
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) setLoadError(recordErrorMessage(error));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  function handleFileChange(file: File | undefined) {
    setSuccessMessage(null);
    setFormError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFormError("Choose a file smaller than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!MIME_BY_EXTENSION[extension]) {
      setSelectedFile(null);
      setFormError("Choose a PDF, JPG, PNG, or WEBP file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      setFormError("Choose a file to add to your records.");
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() ?? "";
    setIsSaving(true);
    setFormError(null);
    setSuccessMessage(null);
    try {
      const response = await createMedicalDocument({
        fileName: selectedFile.name,
        documentType,
        mimeType: MIME_BY_EXTENSION[extension]!,
        contentBase64: await readAsBase64(selectedFile),
      });
      setDocuments((current) => [response.data, ...current]);
      setSelectedFile(null);
      setDocumentType("LAB_REPORT");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessMessage("Medical record added and saved securely.");
    } catch (error) {
      setFormError(recordErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownload(document: MedicalDocument) {
    setDownloadingId(document.id);
    setLoadError(null);
    try {
      const file = await downloadMedicalDocument(document.id);
      const url = URL.createObjectURL(file);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setLoadError(recordErrorMessage(error));
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleView(document: MedicalDocument) {
    setViewingId(document.id);
    setLoadError(null);
    try {
      const file = await downloadMedicalDocument(document.id);
      setPreview({ document, url: URL.createObjectURL(file) });
    } catch (error) {
      setLoadError(recordErrorMessage(error));
    } finally {
      setViewingId(null);
    }
  }

  async function handleDelete(document: MedicalDocument) {
    if (
      !window.confirm(
        `Remove “${document.fileName}” from your medical records?`,
      )
    )
      return;
    setDeletingId(document.id);
    setLoadError(null);
    try {
      await deleteMedicalDocument(document.id);
      setDocuments((current) =>
        current.filter((item) => item.id !== document.id),
      );
      setSuccessMessage("Medical record removed.");
    } catch (error) {
      setLoadError(recordErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7 pb-10">
      {preview && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreview(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="medical-record-preview-title"
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h2
                  id="medical-record-preview-title"
                  className="truncate text-sm font-semibold text-slate-900 sm:text-base"
                >
                  {preview.document.fileName}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Private preview · press Esc to close
                </p>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setPreview(null)}
                aria-label="Close preview"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                ×
              </button>
            </header>
            <div className="grid min-h-[45vh] flex-1 place-items-center overflow-auto bg-slate-100 p-3 sm:p-6">
              {preview.document.mimeType === "application/pdf" ? (
                <iframe
                  title={`Preview of ${preview.document.fileName}`}
                  src={preview.url}
                  className="h-[72vh] min-h-[420px] w-full rounded-lg bg-white"
                />
              ) : (
                <img
                  src={preview.url}
                  alt={preview.document.fileName}
                  className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-sm"
                />
              )}
            </div>
          </section>
        </div>
      )}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">
            Your health information
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Medical records
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Keep lab reports, prescriptions, and other important documents
            together in one secure place.
          </p>
        </div>
        <span className="w-fit rounded-full bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-800">
          {documents.length} {documents.length === 1 ? "record" : "records"}
        </span>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Add a medical record
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload a PDF or image up to 5 MB. Files are stored with your patient
            record.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Record type
            <select
              value={documentType}
              onChange={(event) =>
                setDocumentType(event.target.value as MedicalDocumentType)
              }
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            >
              {MEDICAL_DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {DOCUMENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Document file
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => handleFileChange(event.target.files?.[0])}
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>

          {selectedFile && (
            <p className="text-xs text-slate-500 sm:col-span-2">
              Selected:{" "}
              <span className="font-medium text-slate-700">
                {selectedFile.name}
              </span>{" "}
              · {formatFileSize(selectedFile.size)}
            </p>
          )}
          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2"
            >
              {formError}
            </p>
          )}
          {successMessage && (
            <p
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:col-span-2"
            >
              {successMessage}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
            <p className="max-w-xl text-xs leading-5 text-slate-500">
              Supported formats: PDF, JPG, PNG, and WEBP. Keep original
              documents for your own reference.
            </p>
            <button
              type="submit"
              disabled={isSaving || !selectedFile}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving record…" : "Save medical record"}
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="saved-records-heading">
        <div className="mb-4">
          <h2
            id="saved-records-heading"
            className="text-lg font-semibold text-slate-900"
          >
            Saved records
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your uploaded documents, newest first.
          </p>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <span>{loadError}</span>
            {isLoading && <span className="text-xs">Loading records…</span>}
            {!isLoading && documents.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setRetryCount((count) => count + 1);
                }}
                className="font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div
            className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500"
            aria-live="polite"
          >
            Loading your medical records…
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((document) => (
              <MedicalDocumentCard
                key={document.id}
                document={document}
                onDelete={handleDelete}
                onView={handleView}
                onDownload={handleDownload}
                deleting={deletingId === document.id}
                viewing={viewingId === document.id}
                downloading={downloadingId === document.id}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <span
              aria-hidden="true"
              className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M6 3.75h8l4 4v12.5H6z" />
                <path d="M14 4v4h4M12 11v6m-3-3h6" />
              </svg>
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              Your records start here
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add your first lab result, prescription, or scan. You can download
              or remove your uploads at any time.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
