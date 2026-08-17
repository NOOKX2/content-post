/**
 * Structured LINE logs — filter terminal / Vercel with: [line]
 */
export function logLine(
  level: "info" | "warn" | "error",
  step: string,
  message: string,
  data?: Record<string, unknown>
) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  const line = `[line] ${step} | ${message}${suffix}`;
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}
