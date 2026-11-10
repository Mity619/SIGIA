// Filtros combinables del listado (HU-11). Se aplican en memoria.
import { toCents } from "./money";
import type { DomainEntry, DomainItem, Frequency } from "./types";

export interface ItemFilters {
  /** Texto libre; ignora mayúsculas y tildes. */
  name?: string;
  /** Fecha inicial inclusiva (día local). */
  from?: Date;
  /** Fecha final inclusiva (día local). */
  to?: Date;
  /** Etiqueta: frecuencia ("freq:daily") o grupo ("group:<id>"). */
  tag?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const normalizeText = (text: string): string =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export const hasActiveFilters = (f: ItemFilters): boolean =>
  Boolean(f.name?.trim()) ||
  f.from !== undefined ||
  f.to !== undefined ||
  Boolean(f.tag) ||
  f.minAmount !== undefined ||
  f.maxAmount !== undefined;

const FREQUENCIES: readonly Frequency[] = ["eventual", "daily", "weekly", "monthly", "annual"];

/**
 * Devuelve la etiqueta solo si todavía apunta a algo que existe; si no, undefined.
 * Evita un "filtro fantasma": un grupo eliminado (o un enlace viejo) dejaba la
 * lista filtrada mientras el selector mostraba "Todas".
 */
export const resolveTag = (
  tag: string | undefined,
  groupIds: readonly string[],
): string | undefined => {
  if (!tag) return undefined;
  const [kind, value] = tag.split(":");
  if (kind === "freq" && FREQUENCIES.includes(value as Frequency)) return tag;
  if (kind === "group" && value && groupIds.includes(value)) return tag;
  return undefined;
};

const startOfDay =(d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfNextDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

const matchesTag = (item: DomainItem, tag: string): boolean => {
  const [kind, value] = tag.split(":");
  if (kind === "freq") return item.frequency === (value as Frequency);
  if (kind === "group") return item.groupIds.includes(value);
  return true;
};

const entryMatches = (entry: DomainEntry, f: ItemFilters): boolean => {
  const t = entry.date.getTime();
  if (f.from && t < startOfDay(f.from).getTime()) return false;
  if (f.to && t >= startOfNextDay(f.to).getTime()) return false;
  const cents = toCents(entry.amount);
  if (f.minAmount !== undefined && cents < toCents(f.minAmount)) return false;
  if (f.maxAmount !== undefined && cents > toCents(f.maxAmount)) return false;
  return true;
};

/**
 * Devuelve los conceptos que cumplen todos los filtros.
 * Fecha y valor son datos del movimiento: un concepto pasa si tiene AL MENOS UN
 * movimiento que cumpla a la vez el rango de fecha y el de valor.
 */
export const filterItems = <T extends DomainItem>(
  items: T[],
  entries: DomainEntry[],
  f: ItemFilters,
): T[] => {
  const needle = f.name ? normalizeText(f.name) : "";
  const usesEntryFilters =
    f.from !== undefined || f.to !== undefined || f.minAmount !== undefined || f.maxAmount !== undefined;

  let matchingItemIds: Set<string> | null = null;
  if (usesEntryFilters) {
    matchingItemIds = new Set();
    for (const e of entries) if (entryMatches(e, f)) matchingItemIds.add(e.itemId);
  }

  return items.filter((item) => {
    if (needle && !normalizeText(item.name).includes(needle)) return false;
    if (f.tag && !matchesTag(item, f.tag)) return false;
    if (matchingItemIds && !matchingItemIds.has(item.id)) return false;
    return true;
  });
};

export type EntrySortKey = "date" | "amount";
export type SortDirection = "asc" | "desc";

/** Ordena el historial por fecha o valor (HU-12). No muta el arreglo original. */
export const sortEntries = <T extends Pick<DomainEntry, "date" | "amount">>(
  entries: T[],
  key: EntrySortKey,
  direction: SortDirection,
): T[] => {
  const sign = direction === "asc" ? 1 : -1;
  return [...entries].sort((a, b) => {
    const diff =
      key === "date" ? a.date.getTime() - b.date.getTime() : toCents(a.amount) - toCents(b.amount);
    // desempate estable por fecha
    return sign * (diff || a.date.getTime() - b.date.getTime());
  });
};
