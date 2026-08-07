const BANGKOK_TZ = "Asia/Bangkok";

export function bangkokYmd(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BANGKOK_TZ }).format(
    date
  );
}

export function tomorrowBangkokYmd(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return bangkokYmd(tomorrow);
}

export function previousMonthKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  let year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
  let month = Number(parts.find((p) => p.type === "month")?.value ?? "0");
  month -= 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function isFirstDayOfMonthBangkok(date = new Date()): boolean {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK_TZ,
    day: "numeric",
  }).format(date);
  return day === "1";
}
