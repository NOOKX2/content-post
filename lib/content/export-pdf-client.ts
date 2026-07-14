export async function downloadContentPdf(
  id: string,
  filename: string
): Promise<void> {
  const res = await fetch(`/api/content/${id}/pdf`);

  if (!res.ok) {
    let message = "ส่งออก PDF ไม่สำเร็จ กรุณาลองใหม่";
    try {
      const json = (await res.json()) as {
        error?: string;
        details?: { message?: string };
      };
      if (json.details?.message) {
        message = `${json.error ?? message}\n\n${json.details.message}`;
      } else if (json.error) {
        message = json.error;
      }
    } catch {
      // keep fallback
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
