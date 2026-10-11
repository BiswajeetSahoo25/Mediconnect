export function formatAppointmentStartAt(
  value: string | null,
  timeZone: string,
) {
  if (!value) return "Time not recorded";
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return "Time unavailable";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
      timeZoneName: "short",
    }).format(instant);
  } catch {
    return "Time unavailable";
  }
}
