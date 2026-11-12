// Traduce documentos de Firestore a tipos de dominio (Date en vez de Timestamp).
import type { DomainEntry, DomainItem } from "@/domain";
import type { EntryDoc, ItemDoc } from "./types/items.types";

export const toDomainItem = (item: ItemDoc): DomainItem => ({
  id: item.id ?? "",
  name: item.name,
  type: item.type,
  frequency: item.frequency,
  groupIds: item.groupIds ?? [],
  lastAmount: item.lastAmount ?? 0,
});

export const toDomainEntry = (entry: EntryDoc): DomainEntry => ({
  id: entry.id ?? "",
  itemId: entry.itemId,
  type: entry.type,
  amount: entry.amount,
  // Un serverTimestamp pendiente llega como null en el primer snapshot local
  date: entry.date?.toDate() ?? new Date(),
});
