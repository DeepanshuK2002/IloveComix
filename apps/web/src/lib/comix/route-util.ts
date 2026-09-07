export function boolParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: boolean
): boolean {
  const value = searchParams.get(key);
  if (value === null) return fallback;
  return value === "true" || value === "1";
}

export function intParam(searchParams: URLSearchParams, key: string, fallback: number): number {
  const raw = searchParams.get(key);
  if (raw === null) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback;
}

/** Reads a parameter that may be passed as `key[]=a&key[]=b`, `key=a,b`, or repeated `key=a&key=b`. */
export function csvArray(searchParams: URLSearchParams, key: string): string[] {
  const bracketValues = searchParams.getAll(`${key}[]`);
  const plainValues = searchParams.getAll(key);
  const assigned: string[] = [];
  const push = (value: string) => {
    for (const piece of value.split(",")) {
      const trimmed = piece.trim();
      if (trimmed && !assigned.includes(trimmed)) assigned.push(trimmed);
    }
  };
  for (const value of [...plainValues, ...bracketValues]) push(value);
  return assigned;
}