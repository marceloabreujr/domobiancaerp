/** Converte string de data (YYYY-MM-DD) para Date, ou retorna undefined */
export function toDate(val: string | undefined | null): Date | undefined {
  if (!val) return undefined;
  return new Date(val);
}

/** Converte string de data para Date, obrigatório */
export function toDateRequired(val: string): Date {
  return new Date(val);
}

/** Remove campos undefined de um objeto para update parcial */
export function cleanUpdate<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result as Partial<T>;
}
