export async function downloadContentPdf(
  id: string,
  filename: string
): Promise<void> {
  const res = await fetch(`/api/content/${id}/pdf`);

  if (!res.ok) {
    throw new Error("export_failed");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
