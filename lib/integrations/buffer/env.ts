function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/** Reads a Buffer env var and strips a pasted `NAME=value` prefix. */
export function readBufferEnv(name: string): string {
  const raw = stripWrappingQuotes(process.env[name] ?? "");
  if (!raw) return "";

  const prefix = `${name}=`;
  if (raw.startsWith(prefix)) {
    return stripWrappingQuotes(raw.slice(prefix.length));
  }

  return raw;
}
