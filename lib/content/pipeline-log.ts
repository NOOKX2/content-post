/**
 * Structured logs for the approve → n8n → Buffer pipeline.
 * Filter Vercel Logs with: [content-pipeline]
 */
export function logPipeline(
  step: string,
  message: string,
  data?: Record<string, unknown>
) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-pipeline] ${step} | ${message}${suffix}`);
}
