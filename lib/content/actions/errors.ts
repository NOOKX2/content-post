export function formatActionError(
  error: unknown,
  fallback = "เกิดข้อผิดพลาด กรุณาลองใหม่"
): string {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.trim();
  if (!message) return fallback;

  // Prisma known request errors include readable codes/messages.
  const prismaCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : null;

  if (prismaCode) {
    return `${fallback} [${prismaCode}] ${message}`;
  }

  return `${fallback}: ${message}`;
}

export type ApiErrorBody = {
  error: string;
  details?: Record<string, unknown>;
};

export function formatApiErrorResponse(error: unknown): ApiErrorBody {
  const details =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          ...(typeof error === "object" &&
          error !== null &&
          "code" in error &&
          typeof (error as { code?: unknown }).code === "string"
            ? { code: (error as { code: string }).code }
            : {}),
        }
      : { value: String(error) };

  return {
    error: formatActionError(error),
    details,
  };
}

export function formatClientApiError(
  status: number,
  body: { error?: string; details?: Record<string, unknown> }
): string {
  const lines = [`HTTP ${status}`, body.error ?? "Request failed"];
  if (body.details) {
    lines.push(JSON.stringify(body.details, null, 2));
  }
  return lines.join("\n\n");
}

export function logActionError(
  action: string,
  error: unknown,
  meta?: Record<string, unknown>
) {
  const details =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...Object.fromEntries(
            Object.entries(error as unknown as Record<string, unknown>).filter(
              ([key]) => !["name", "message", "stack"].includes(key)
            )
          ),
        }
      : { value: error };

  console.error(`[content/actions] ${action} failed`, {
    ...meta,
    error: details,
  });
}
