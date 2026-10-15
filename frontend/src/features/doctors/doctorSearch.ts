export const MAX_DOCTOR_SEARCH_LENGTH = 100;

export function validateDoctorSearch(value: string) {
  const query = value.trim();
  if (!query) return { query: "", error: "Enter a doctor's name or licence number to search." };
  if (query.length > MAX_DOCTOR_SEARCH_LENGTH) {
    return {
      query,
      error: `Search must be ${MAX_DOCTOR_SEARCH_LENGTH} characters or fewer.`,
    };
  }
  return { query, error: "" };
}

export function buildDoctorDirectorySearchPath(value: string) {
  const query = value.trim();
  const params = new URLSearchParams();
  if (query) params.set("search", query.slice(0, MAX_DOCTOR_SEARCH_LENGTH));
  const search = params.toString();
  return search ? `/doctors?${search}` : "/doctors";
}

export function readDoctorDirectorySearchParams(params: URLSearchParams) {
  return {
    search: (params.get("search") ?? "").trim().slice(0, MAX_DOCTOR_SEARCH_LENGTH),
    specialization: params.get("specialty") ?? params.get("specializationId") ?? "",
  };
}

export function updateDoctorSearchParam(params: URLSearchParams, value: string) {
  const nextParams = new URLSearchParams(params);
  const query = value.trim().slice(0, MAX_DOCTOR_SEARCH_LENGTH);
  if (query) nextParams.set("search", query);
  else nextParams.delete("search");
  return nextParams;
}
